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

import { toast } from "react-toastify";

import { InterContexts } from "../../../contexts/inter";

export default function InterConfig() {
    const { saveConfig } = useContext(InterContexts);
    const [url, setUrl] = useState("");

    const handleCadastrar = async () => {
        const result = await saveConfig(url);
        if (result) {
            toast.success("Dados salvos");
        } else {
            toast.error("Erro ao salvar os dados");
        }
    };

    const handleLimpar = () => {
        setUrl("");
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
