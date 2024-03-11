import { useState, useEffect, createContext, useContext } from "react";

import { db } from "../services/firebaseConnection";
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    query,
    where,
    deleteDoc,
    updateDoc,
} from "firebase/firestore";

import { AuthContexts } from "./auth";

import { sleep } from "../utils/config";

import moment from "moment";

import { useSnackbar } from "notistack";
import { toast } from "react-toastify";

export const WhatsAppContexts = createContext({});

function WhatsAppProvider({ children }) {
    const { user } = useContext(AuthContexts);
    const { enqueueSnackbar } = useSnackbar();

    async function wppCriarInstancia(instancia) {
        const config = JSON.parse(localStorage.getItem("@WppConfig"));
        if (config) {
            try {
                const response = await fetch(
                    `${config.url}/session/start/${instancia}`,
                    {
                        method: "GET",
                        headers: {
                            accept: "application/json",
                            "x-api-key": config.apiKey,
                        },
                    }
                );

                if (!response.ok) {
                    if (response.status === 422) {
                        return {
                            success: false,
                            error: `Já existe sessão para: ${instancia} `,
                        };
                    } else if (response.status === 403) {
                        return {
                            success: false,
                            error: `Chave de API inválida`,
                        };
                    } else {
                        return {
                            success: false,
                            error: `Erro ao criar instância`,
                        };
                    }
                }

                const instanciasCol = collection(db, "instancias");

                const docRef = await addDoc(instanciasCol, {
                    instancia: instancia,
                    createdAt: moment().toDate(),
                    usuario: user.nome,
                });

                if (docRef) {
                    const data = await response.json();
                    return data;
                }
            } catch (error) {
                throw new Error(
                    `Failed to fetch wppCriarInstancia: ${error.message}`
                );
            }
        }
    }

    async function wppDeletarInstancia(instancia) {
        const config = JSON.parse(localStorage.getItem("@WppConfig"));
        let result = { success: false, message: "" };
        if (config) {
            try {
                const response = await fetch(
                    `${config.url}/session/terminate/${instancia}`,
                    {
                        method: "GET",
                        headers: {
                            accept: "application/json",
                            "x-api-key": config.apiKey,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`Erro HTTP! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    const colecaoRef = collection(db, "instancias");
                    const q = query(
                        colecaoRef,
                        where("instancia", "==", instancia)
                    );
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        let foundDocument = false; // Variável para rastrear se o documento foi encontrado
                        for (const doc of querySnapshot.docs) {
                            await deleteDoc(doc.ref);
                            const documentSnapshot = await getDoc(doc.ref);

                            if (!(await documentSnapshot.exists())) {
                                result.message =
                                    "Instância excluída com sucesso.";
                                foundDocument = true;
                            } else {
                                console.log(
                                    "Erro: Documento ainda existe no banco de dados."
                                );
                                result.message =
                                    "Erro: Documento ainda existe no banco de dados.";
                            }
                        }
                        result.success = foundDocument;
                    } else {
                        console.log("Documento não encontrado.");
                        result.message = "Documento não encontrado.";
                    }
                } else {
                    console.log("Falha ao terminar sessão.");
                    result.message = "Falha ao terminar sessão.";
                }
            } catch (error) {
                console.error("Erro ao excluir instância:", error);
                result.message = "Erro ao excluir instância";
            }
        }

        return result;
    }

    async function wppListarInstancias(url, key) {
        const colecaoRef = collection(db, "instancias");
        const querySnapshot = await getDocs(colecaoRef);

        let lista = [];

        for (const doc of querySnapshot.docs) {
            const instanciaData = doc.data();

            const status = await wppStatus(instanciaData.instancia);
            if (status.api) {
                instanciaData.status = status;
                if (status.success) {
                    const info = await wppInfo(instanciaData.instancia);
                    instanciaData.info = info?.sessionInfo;
                }
                lista.push(instanciaData);
            } else {
                toast.error(status.error);
                return lista;
            }
        }

        return lista;
    }

    async function wppStatus(instancia) {
        const config = JSON.parse(localStorage.getItem("@WppConfig"));
        if (config) {
            try {
                const response = await fetch(
                    `${config.url}/session/status/${instancia}`,
                    {
                        method: "GET",
                        headers: {
                            accept: "application/json",
                            "x-api-key": config.apiKey,
                        },
                    }
                );
                if (!response.ok) {
                    if (response.status === 403) {
                        return {
                            success: false,
                            error: `Chave de API inválida`,
                            api: false,
                        };
                    } else {
                        return {
                            success: false,
                            error: `Erro buscar status`,
                            api: false,
                        };
                    }
                }
                const data = await response.json();
                data.api = true;
                return data;
            } catch (error) {
                return {
                    success: false,
                    error: `Prpblema com o servidor`,
                    api: false,
                };
            }
        }
    }

    async function wppInfo(instancia) {
        const config = JSON.parse(localStorage.getItem("@WppConfig"));
        if (config) {
            try {
                const response = await fetch(
                    `${config.url}/client/getClassInfo/${instancia}`,
                    {
                        method: "GET",
                        headers: {
                            accept: "application/json",
                            "x-api-key": config.apiKey,
                        },
                    }
                );
                if (!response.ok) {
                    if (response.status === 403) {
                        return {
                            success: false,
                            error: `Chave de API inválida`,
                            api: false,
                        };
                    } else {
                        return {
                            success: false,
                            error: `Erro buscar info`,
                            api: false,
                        };
                    }
                }
                const data = await response.json();
                return data;
            } catch (error) {
                return {
                    success: false,
                    error: `Prpblema com o servidor`,
                    api: false,
                };
            }
        }
    }

    async function wppQrCode(instancia) {
        const config = JSON.parse(localStorage.getItem("@WppConfig"));
        if (config) {
            try {
                const response = await fetch(
                    `${config.url}/session/qr/${instancia}/image`,
                    {
                        method: "GET",
                        headers: {
                            accept: "image/png",
                            "x-api-key": config.apiKey,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.blob();
                return URL.createObjectURL(data);
            } catch (error) {
                console.error("Failed to fetch wppStatus:", error.message);
                return null;
            }
        }
    }

    async function saveConfig(url, key, cobranca) {
        const configCol = collection(db, "wppConfig");
        const querySnapshot = await getDocs(configCol);

        let docRef;

        if (querySnapshot.size === 0) {
            docRef = await addDoc(configCol, {
                url: url,
                apiKey: key,
                cobranca: cobranca,
            });
        } else {
            const doc = querySnapshot.docs[0];
            docRef = doc.ref;
            await updateDoc(docRef, {
                url: url,
                apiKey: key,
                cobranca: cobranca,
            });
        }

        if (docRef.id) {
            localStorage.setItem(
                "@WppConfig",
                JSON.stringify({
                    url: url,
                    apiKey: key,
                    cobranca: cobranca,
                    docRef: docRef.id,
                })
            );

            return true;
        } else {
            return false;
        }
    }

    async function getConfigWpp() {
        const configCol = collection(db, "wppConfig");
        const querySnapshot = await getDocs(configCol);

        if (querySnapshot.size > 0) {
            const doc = querySnapshot.docs[0];
            return doc.data();
        } else {
            return null;
        }
    }

    async function wppEnviarMsg(
        instancia,
        numeros,
        mensagem,
        deley,
        tipo,
        origem,
        description
    ) {
        const config = JSON.parse(localStorage.getItem("@WppConfig"));
        let lista = [];

        if (config) {
            for (let i = 0; i < numeros.length; i++) {
                const element = numeros[i];

                try {
                    const response = await fetch(
                        `${config.url}/client/sendMessage/${instancia}`,
                        {
                            method: "POST",
                            headers: {
                                accept: "*/*",
                                "x-api-key": config.apiKey,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                chatId: `55${element}@c.us`,
                                contentType: tipo,
                                content: mensagem,
                                options: { description: description },
                            }),
                        }
                    );
                    if (!response.ok) {
                        throw new Error(
                            `HTTP error! status: ${response.status}`
                        );
                    }
                    const data = await response.json();
                    lista.push(data);

                    enqueueSnackbar(
                        `Mensagem ${i + 1}/${numeros.length} enviada`,
                        {
                            variant: "success",
                        }
                    );
                } catch (error) {
                    console.log("Failed to send message:", error.message);
                }

                await sleep(deley * 1000);
            }
        }

        const mensagemCol = collection(db, "mensagensEnviadas");

        const docRef = await addDoc(mensagemCol, {
            mensagens: lista,
            enviada: moment().toDate(),
            usuario: user.nome,
            origem: origem,
        });

        if (docRef) {
            return lista;
        }

        return lista;
    }

    return (
        <WhatsAppContexts.Provider
            value={{
                wppCriarInstancia,
                wppDeletarInstancia,
                wppListarInstancias,
                wppStatus,
                wppQrCode,
                saveConfig,
                getConfigWpp,
                wppEnviarMsg,
            }}
        >
            {children}
        </WhatsAppContexts.Provider>
    );
}

export default WhatsAppProvider;
