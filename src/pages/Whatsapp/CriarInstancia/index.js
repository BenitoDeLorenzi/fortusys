import { useState, useContext } from "react";

import {
    Typography,
    Paper,
    Container,
    TextField,
    Button,
    Grid,
    CircularProgress,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import { WhatsAppContexts } from "../../../contexts/whatsapp";

import moment from "moment";

export default function WhatsAppCriarInstancia() {
    const { wppCriarInstancia } = useContext(WhatsAppContexts);
    const navigate = useNavigate();

    const [nomeInstancia, setNomeInstancia] = useState("");
    const [errorNomeInstancia, setErrorNomeInstancia] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleCriarInstancia() {
        if (nomeInstancia === "") {
            setErrorNomeInstancia(true);
            return;
        }

        setLoading(true);

        try {
            const resultado = await wppCriarInstancia(nomeInstancia);
            if (resultado.success) {
                toast.success("Instancia criada com sucesso");
                navigate("/listarInstWpp");
            } else {
                toast.error(resultado.error);
            }
        } catch (error) {
            console.log(error);
        }

        setLoading(false);
    }

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
                    Criar instância
                </Typography>
                <Grid container mt={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            sx={{ width: "100%" }}
                            label="Nome da instância"
                            required
                            value={nomeInstancia}
                            onChange={(e) => {
                                setErrorNomeInstancia(false);
                                setNomeInstancia(e.target.value);
                            }}
                            error={errorNomeInstancia}
                            helperText={
                                errorNomeInstancia &&
                                "Preencha o nome da instância"
                            }
                        />
                    </Grid>
                </Grid>
                <Grid container mt={2}>
                    <Grid item xs={12} md={3}>
                        <Button
                            variant="contained"
                            onClick={handleCriarInstancia}
                            sx={{ width: "150px" }}
                        >
                            {loading ? (
                                <CircularProgress color="inherit" size={25} />
                            ) : (
                                "Criar instância"
                            )}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}
