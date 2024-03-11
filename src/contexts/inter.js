import { createContext, useState, useEffect, useContext } from "react";
import { db } from "../services/firebaseConnection";
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    doc,
    updateDoc,
} from "firebase/firestore";

import { sleep } from "../utils/config";

import { WhatsAppContexts } from "./whatsapp";

import { useSnackbar } from "notistack";
import ReportComplete from "../components/ReportComplete";
import moment from "moment";

import { useNavigate } from "react-router-dom";

export const InterContexts = createContext({});

const InterProvider = ({ children }) => {
    const config = JSON.parse(localStorage.getItem("@InterConfig"));
    const navigate = useNavigate();

    const { wppEnviarMsg, getConfig } = useContext(WhatsAppContexts);

    const { enqueueSnackbar } = useSnackbar();

    async function saveConfig(url) {
        const configCol = collection(db, "interConfig");
        const querySnapshot = await getDocs(configCol);

        let docRef;

        if (querySnapshot.size === 0) {
            docRef = await addDoc(configCol, {
                url: url,
            });
        } else {
            const doc = querySnapshot.docs[0];
            docRef = doc.ref;
            await updateDoc(docRef, {
                url: url,
            });
        }

        if (docRef.id) {
            localStorage.setItem(
                "@InterConfig",
                JSON.stringify({
                    url: url,
                    docRef: docRef.id,
                })
            );
            return true;
        } else {
            return false;
        }
    }

    async function getConfigInter() {
        const configCol = collection(db, "interConfig");
        const querySnapshot = await getDocs(configCol);

        if (querySnapshot.size > 0) {
            const doc = querySnapshot.docs[0];
            return doc.data();
        } else {
            return null;
        }
    }

    async function getToken() {
        let result;
        let token;
        let tokenId;
        const colecaoRef = collection(db, "token");

        const q = query(colecaoRef, where("tipo", "==", "boleto"));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const documento = querySnapshot.docs[0].data();
            tokenId = querySnapshot.docs[0].id;
            token = documento;
        }

        const createdAtMoment = moment.unix(token.createdAt.seconds);
        const horaDepois = createdAtMoment.add(1, "hour");
        const passouUmaHora = moment().isAfter(horaDepois);

        if (passouUmaHora) {
            const response = await fetch(config.url + "/inter/getToken", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                result = await response.json();
                await updateDoc(doc(db, "token", tokenId), {
                    ...result,
                    createdAt: new Date(),
                    tipo: "boleto",
                });
            }
            return result;
        } else {
            return token;
        }
    }

    async function getBoletos(params) {
        const response = await fetch(config.url + "/inter/getBoletos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                params: params,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async function getSumario(params) {
        const token = await getToken();
        const response = await fetch(config.url + "/inter/getSumario", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                dados: params.dados,
                token: token,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    async function getPdf(fileName, listaCodigo) {
        const token = await getToken();
        try {
            const response = await fetch(config.url + "/inter/getPdf", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    codigoSolicitacao: listaCodigo,
                    token: token,
                    fileName: fileName,
                }),
            });

            if (!response.ok) {
                throw new Error(`Erro ao baixar o PDF: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Erro ao baixar o PDF:", error.message);
        }
    }

    async function enviarBoletos(dados) {
        const parcelas = dados.cobranca.parcelas;
        const cobranca = dados.cobranca;
        const pagador = dados.pagador;
        const token = await getToken();
        const fileName = pagador.nome + "_" + cobranca.seuNumero + ".pdf";

        let dadosEnvio = {
            ...cobranca,
            valorNominal:
                cobranca.valorParcela === 0
                    ? cobranca.valorNominal
                    : cobranca.valorParcela,
            pagador: pagador,
        };

        let listaCodigo = [];

        for (let o = 0; o < parcelas; o++) {
            const dataVencimento = moment(cobranca.dataVencimento)
                .add(o, "months")
                .format("YYYY-MM-DD");

            dadosEnvio.dataVencimento = dataVencimento;
            dadosEnvio.mensagem = {
                linha1: `Parcela ${o + 1}/${parcelas}`,
            };
            dadosEnvio.parcela = `${o + 1}/${parcelas}`;

            const response = await fetch(config.url + "/inter/enviarBoleto", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    params: dadosEnvio,
                    token: token,
                }),
            });

            if (!response.ok) {
                console.log(`HTTP error! status: ${response.status}`);
            } else {
                const data = await response.json();
                if (data && data.codigoSolicitacao) {
                    listaCodigo.push(data.codigoSolicitacao);
                }
                enqueueSnackbar(`Boleto ${o + 1}/${parcelas} gerado`, {
                    variant: "success",
                });
            }

            await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        dadosEnvio.codigoSolicitacao = listaCodigo;

        const pdf = await getPdf(fileName, listaCodigo);

        if (pdf) {
            dadosEnvio.linkPdf = pdf.link;
            const pagadorId = await salvarPagador(dadosEnvio);
            const cobrancaId = await salvarCobranca(dadosEnvio, pagadorId);
            await salvarSeuNumero(dados.cobranca.seuNumero, cobrancaId);

            await enviarMsg(pagador, pdf).then(() => {
                enqueueSnackbar(
                    "Boleto " + cobranca.seuNumero + " está pronto!",
                    {
                        variant: "reportComplete",
                        persist: true,
                        allowDownload: true,
                        content: (key, message) => (
                            <ReportComplete
                                id={key}
                                message={message}
                                download={pdf.link}
                            />
                        ),
                    }
                );
                navigate("/bancoInter");
            });
        }

        return dadosEnvio;
    }

    async function enviarMsg(pagador, pdf) {
        const wppConfigData = await getConfig();

        await sleep(3000);

        await wppEnviarMsg(
            wppConfigData.cobranca,
            [pagador.ddd + pagador.telefone],
            `Olá *${pagador.nome}* 😃. Somos da Magazine Fortulino e queremos dar os parabéns por avançarmos juntos na renegociação das suas dívidas! 
Estamos aqui para apoiá-lo em sua jornada financeira. 😊 

Aqui estão seus boletos para pagamento.`,
            5,
            "string",
            "aviso"
        );

        await wppEnviarMsg(
            wppConfigData.cobranca,
            [pagador.ddd + pagador.telefone],
            pdf.link,
            5,
            "MessageMediaFromURL",
            "cobranca",
            `Olá *${pagador.nome}*. Somos da Magazine Fortulino e queremos dar os parabéns 
            por avançarmos juntos na renegociação das suas dívidas! 
            Estamos aqui para apoiá-lo em sua jornada financeira. 😊 
            Aqui estão seus boletos para pagamento.`
        );
    }

    async function salvarPagador(dados) {
        const pagadoresCol = collection(db, "pagadores");
        const cpfCnpj = dados.pagador.cpfCnpj;
        const q = query(pagadoresCol, where("cpfCnpj", "==", cpfCnpj));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            const docRef = await addDoc(pagadoresCol, dados.pagador);
            return docRef.id;
        } else {
            const documentoExistenteId = querySnapshot.docs[0].id;
            const docRef = doc(db, "pagadores", documentoExistenteId);

            await updateDoc(docRef, dados.pagador);
            return documentoExistenteId;
        }
    }

    async function salvarCobranca(dados, idPagador) {
        const cobranca = {
            ...dados,
            idPagador: idPagador,
            createdAt: new Date(),
        };
        const cobrancaCol = collection(db, "cobrancas");
        const docRef = await addDoc(cobrancaCol, cobranca);
        return docRef.id;
    }

    async function salvarSeuNumero(seuNumero, cobrancaId) {
        const partes = seuNumero.split("-");

        const resultado = {
            departamento: partes[0],
            numero: parseInt(partes[1], 10),
            cobrancaId: cobrancaId,
        };

        const seuNumeroCol = collection(db, "seuNumero");
        const docRef = await addDoc(seuNumeroCol, resultado);
        return docRef.id;
    }

    async function getPagador(cpfCnpj) {
        const colecaoRef = collection(db, "pagadores");
        const q = query(colecaoRef, where("cpfCnpj", "==", cpfCnpj));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const documento = querySnapshot.docs[0].data();
            return documento;
        }
        return;
    }

    async function cancelarBoleto(nossoNumero, codigoSolicitacao, motivo) {
        const token = await getToken();
        try {
            const response = await fetch(config.url + "/inter/cancelarBoleto", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nossoNumero: nossoNumero,
                    codigoSolicitacao: codigoSolicitacao,
                    motivo: motivo,
                    token: token,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `Erro ao cancelar o boleto: ${response.statusText}`
                );
            }

            return await response.json();
        } catch (error) {
            console.error("Erro ao cancelar o boleto:", error.message);
        }
    }

    return (
        <InterContexts.Provider
            value={{
                saveConfig,
                getConfigInter,
                getToken,
                getBoletos,
                getSumario,
                getPagador,
                getPdf,
                enviarBoletos,
                cancelarBoleto,
            }}
        >
            {children}
        </InterContexts.Provider>
    );
};

export default InterProvider;
