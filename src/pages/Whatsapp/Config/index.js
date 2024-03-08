import { useState, useEffect, useContext } from "react";

import {
    Container,
    Paper,
    Typography,
    Grid,
    TextField,
    Button,
    Box,
} from "@mui/material";

import { WhatsAppContexts } from "../../../contexts/whatsapp";

import { toast } from "react-toastify";

export default function WhatsAppConfig() {
    const { saveConfig, getConfig, wppListarInstancias } =
        useContext(WhatsAppContexts);

    const [url, setUrl] = useState("");
    const [key, setKey] = useState("");
    const [instancia, setInstancia] = useState("");

    useEffect(() => {
        async function fetchConfig() {
            const result = await getConfig();
            if (result) {
                setUrl(result.url);
                setKey(result.apiKey);
                setInstancia(result.cobranca);
            }
        }
        fetchConfig();
    }, [getConfig, wppListarInstancias]);

    const handleCadastrar = async () => {
        const result = saveConfig(url, key, instancia);
        if (result) {
            localStorage.setItem(
                "wppConfig",
                JSON.stringify({ apiKey: key, url: url, cobranca: instancia })
            );
            toast.success("Dados salvos");
        }
    };

    const handleLimpar = () => {
        setUrl("");
        setKey("");
    };

    return (
        <Container>
            <Paper
                elevation={2}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    padding: 2,
                }}
            >
                <Typography variant="h6" color="primary">
                    Configurações
                </Typography>
                <Grid container my={2} spacing={2}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="URL API"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="API KEY"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="INSTÂNCIA DE COBRANÇA"
                            value={instancia}
                            onChange={(e) => setInstancia(e.target.value)}
                        />
                    </Grid>
                </Grid>
                <Box sx={{ display: "flex" }}>
                    <Button
                        sx={{ width: "200px", marginRight: "10px" }}
                        variant="contained"
                        color="primary"
                        onClick={handleCadastrar}
                    >
                        Cadastrar dados
                    </Button>
                    <Button
                        sx={{ width: "200px" }}
                        variant="outlined"
                        color="primary"
                        onClick={handleLimpar}
                    >
                        Limpar dados
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
