import React, { useState, useContext } from "react";
import {
    Stepper,
    Step,
    StepLabel,
    Container,
    Paper,
    Button,
    Box,
    CircularProgress,
} from "@mui/material";

import moment from "moment";

import { db } from "../../services/firebaseConnection";
import {
    collection,
    query,
    getDocs,
    orderBy,
    limit,
    where,
} from "firebase/firestore";

import { Link } from "react-router-dom";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

import FormularioPagador from "./FormularioPagador";
import FormularioCobranca from "./FormularioCobranca";
import Resumo from "./Resumo";

import { InterContexts } from "../../contexts/inter";

export default function NovoBoleto() {
    const { enviarBoletos, getPagador } = useContext(InterContexts);

    const steps = ["Pagador", "Cobrança", "Resumo"];
    const [activeStep, setActiveStep] = useState(0);

    const [loading, setLoading] = useState(false);

    const [dadosEnvio, setDadosEnvio] = useState({
        pagador: {},
        cobranca: {},
    });

    const [pagador, setPagador] = useState({
        nome: "",
        tipoPessoa: "",
        cpfCnpj: "",
        cep: "",
        uf: "",
        cidade: "",
        bairro: "",
        endereco: "",
        numero: "",
        complemento: "",
        ddd: "",
        telefone: "",
        email: "",
    });

    const [cobranca, setCobranca] = useState({
        seuNumero: "",
        valorNominal: 0,
        parcelas: 1,
        valorParcela: 0,
        numDiasAgenda: 30,
        dataVencimento: moment().add(1, "month").format("YYYY-MM-DD"),
        cnpjCPFBeneficiario: "00424042000150",
        multa: {
            taxa: 1,
            codigo: "PERCENTUAL",
        },
        mora: {
            taxa: 0.33,
            codigo: "TAXAMENSAL",
        },
    });

    const [ufSelected, setUfSelected] = useState(pagador.uf);

    const [errorsPagador, setErrorsPagador] = useState({});
    const [errorsCobranca, setErrorsCobranca] = useState({});

    const validadeFormPagador = () => {
        let newErrors = {};
        if (!pagador.nome) newErrors.nome = "Nome é obrigatório";
        if (!pagador.tipoPessoa)
            newErrors.tipoPessoa = "Tipo de pessoa é obrigatório";
        if (!pagador.cpfCnpj) newErrors.cpfCnpj = "CPF/CNPJ é obrigatório";
        if (!pagador.endereco) newErrors.endereco = "Endereço é obrigatório";
        if (!pagador.cidade) newErrors.cidade = "Cidade é obrigatório";
        if (!pagador.uf) newErrors.uf = "UF é obrigatório";
        if (!pagador.cep) newErrors.cep = "CEP é obrigatório";
        if (!pagador.ddd) newErrors.ddd = "DDD é obrigatório";
        if (!pagador.telefone) newErrors.telefone = "Telefone é obrigatório";

        return newErrors;
    };

    const validadeFormCobranca = () => {
        let newErrors = {};
        if (!cobranca.seuNumero)
            newErrors.seuNumero = "Departamento é obrigatório";
        if (cobranca.valorNominal < 25)
            newErrors.valorNominal = "Valor tem que ser maior que R$ 25,00";

        return newErrors;
    };

    const handleNext = async () => {
        if (activeStep === 0) {
            const newErrors = validadeFormPagador();
            if (Object.keys(newErrors).length > 0) {
                setErrorsPagador(newErrors);
                return;
            }

            setDadosEnvio((prev) => ({
                ...prev,
                pagador: pagador,
            }));
        } else if (activeStep === 1) {
            const newErrors = validadeFormCobranca();
            if (Object.keys(newErrors).length > 0) {
                setErrorsCobranca(newErrors);
                return;
            }
            setDadosEnvio((prev) => ({
                ...prev,
                cobranca: cobranca,
            }));
        } else if (activeStep === 2) {
            setLoading(true);

            const result = await enviarBoletos(dadosEnvio);
            setLoading(false);
        }

        if (activeStep < steps.length - 1) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleChangePagador = (e) => {
        const { name, value } = e.target;
        setPagador((prev) => ({ ...prev, [name]: value }));

        if (errorsPagador[name]) {
            setErrorsPagador({ ...errorsPagador, [name]: null });
        }
    };

    const getSeuNumero = async (departamento) => {
        let lista = [];
        const docRef = collection(db, "seuNumero");
        const q = query(
            docRef,
            where("departamento", "==", departamento),
            orderBy("numero", "desc"),
            limit(1)
        );

        const querySnapShot = await getDocs(q);

        querySnapShot.forEach((docs) => {
            lista.push(docs.data());
        });

        return lista.length > 0 ? lista[0].numero + 1 : 1;
    };

    const handleChangeCobranca = async (e) => {
        const { name, value } = e.target;
        const seuNumero = await getSeuNumero(value);

        if (name === "seuNumero" && value !== "") {
            setCobranca((prev) => ({
                ...prev,
                [name]: name === "seuNumero" ? value + "-" + seuNumero : value,
            }));
        } else if (name === "parcelas") {
            setCobranca((prev) => ({
                ...prev,
                valorParcela: parseFloat(
                    (cobranca.valorNominal / value).toFixed(2)
                ),
                [name]: value,
            }));
        } else {
            setCobranca((prev) => ({
                ...prev,
                [name]: value,
            }));
        }

        if (errorsCobranca[name]) {
            setErrorsCobranca({ ...errorsCobranca, [name]: null });
        }
    };

    const handleTipoPessoa = async (e) => {
        const value = e.target.value;
        const dadosPagador = await getPagador(value.replace(/\D/g, ""));

        if (!dadosPagador) {
            if (value.length === 14) {
                setPagador((prev) => ({ ...prev, tipoPessoa: "FISICA" }));
            } else if (value.length === 18) {
                setPagador((prev) => ({ ...prev, tipoPessoa: "JURIDICA" }));
            } else if (value.length === 0) {
                setPagador((prev) => ({ ...prev, tipoPessoa: "" }));
            }

            setErrorsPagador({ ...errorsPagador, tipoPessoa: null });
        } else {
            setPagador(dadosPagador);
            setUfSelected(dadosPagador.uf);

            const errorsPagadorNull = Object.keys(errorsPagador).reduce(
                (acc, key) => {
                    acc[key] = null;
                    return acc;
                },
                {}
            );

            setErrorsPagador(errorsPagadorNull);
        }
    };

    function getStepContent(stepIndex) {
        switch (stepIndex) {
            case 0:
                return (
                    <FormularioPagador
                        pagador={pagador}
                        setPagador={setPagador}
                        errors={errorsPagador}
                        setErrorsPagador={setErrorsPagador}
                        handleChange={handleChangePagador}
                        handleTipoPessoa={handleTipoPessoa}
                        loading={loading}
                        ufSelected={ufSelected}
                        setUfSelected={setUfSelected}
                    />
                );
            case 1:
                return (
                    <FormularioCobranca
                        cobranca={cobranca}
                        errors={errorsCobranca}
                        handleChange={handleChangeCobranca}
                    />
                );
            case 2:
                return <Resumo dadosEnvio={dadosEnvio} />;
            default:
                return;
        }
    }

    return (
        <Container>
            <Paper
                elevation={5}
                sx={{
                    padding: 5,
                    mt: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Box sx={{ width: "100%", margin: 1 }}>
                    <Link to="/bancoInter" style={{ textDecoration: "none" }}>
                        <Button
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <ArrowBackIosIcon />
                            Boletos
                        </Button>
                    </Link>
                </Box>
                <Stepper
                    sx={{ width: "100%" }}
                    activeStep={activeStep}
                    alternativeLabel
                >
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box sx={{ width: { xs: "100%", md: "70%" }, marginTop: 4 }}>
                    {getStepContent(activeStep)}
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        pt: 2,
                        justifyContent: "flex-end",
                        width: "100%",
                    }}
                >
                    <Button
                        color="inherit"
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                    >
                        Voltar
                    </Button>
                    <Button
                        sx={{ width: "100px" }}
                        variant="contained"
                        onClick={handleNext}
                    >
                        {activeStep === steps.length - 1 ? (
                            loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                "Finalizar"
                            )
                        ) : (
                            "Próximo"
                        )}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
