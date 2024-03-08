import React, { useState, useEffect, useContext } from "react";
import {
    Container,
    Paper,
    Typography,
    Grid,
    Select,
    MenuItem,
    TextField,
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    CircularProgress,
} from "@mui/material";

import { WhatsAppContexts } from "../../../contexts/whatsapp";
import { AuthContexts } from "../../../contexts/auth";

import { toast } from "react-toastify";

import DeleteIcon from "@mui/icons-material/Delete";

export default function WhatsAppDisparador() {
    const { wppListarInstancias, wppEnviarMsg } = useContext(WhatsAppContexts);
    const { user } = useContext(AuthContexts);

    const [instancias, setInstancias] = useState([]);
    const [selectedInstancia, setSelectedInstancia] = useState("");
    const [deley, setDeley] = useState(5);
    const [mensagem, setMensagem] = useState("");
    const [errorMensagem, setErrorMensagem] = useState(false);
    const [ddd, setDdd] = useState("");
    const [telefone, setTelefone] = useState("");
    const [errorTelefone, setErrorTelefone] = useState(false);
    const [errorDdd, setErrorDdd] = useState(false);
    const [numerosAdicionados, setNumerosAdicionados] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        handleGetInstancias();
    }, []);

    const handleGetInstancias = async () => {
        await wppListarInstancias().then((result) => {
            setInstancias(result);
        });
    };

    const handleInstanciaChange = (event) => {
        setSelectedInstancia(event.target.value);
    };

    const handleAdicionarTelefone = () => {
        if (!telefone || !ddd) {
            setErrorTelefone(true);
            setErrorDdd(true);
            return;
        }

        setErrorTelefone(false);
        setErrorDdd(false);
        setNumerosAdicionados([...numerosAdicionados, `${ddd}${telefone}`]);
        setDdd("");
        setTelefone("");
    };

    const handleDeleteNumero = (indexToRemove) => {
        const updatedNumerosAdicionados = numerosAdicionados.filter(
            (numero, index) => index !== indexToRemove
        );
        setNumerosAdicionados(updatedNumerosAdicionados);
    };

    const handleEnviar = async () => {
        if (selectedInstancia === "") {
            toast.error("Selecionar uma instância");
        } else if (numerosAdicionados.length === 0) {
            toast.error("Adicione ao menos 1 número");
        } else if (mensagem === "") {
            setErrorMensagem(true);
        } else {
            setLoading(true);
            await wppEnviarMsg(
                selectedInstancia,
                numerosAdicionados,
                mensagem,
                deley,
                "string",
                "disparador",
                ""
            ).then((result) => {
                setLoading(false);
                setMensagem("");
                setNumerosAdicionados([]);
                setDeley(5);
                toast.success("Mensagens enviadas");
            });
        }
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
                    Disparador
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={5}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={8}>
                                <Select
                                    value={selectedInstancia}
                                    onChange={handleInstanciaChange}
                                    displayEmpty
                                    fullWidth
                                    sx={{ mt: 2 }}
                                >
                                    <MenuItem value="" disabled>
                                        Selecione uma instância
                                    </MenuItem>
                                    {instancias
                                        .filter(
                                            (instancia) =>
                                                instancia.status.success ===
                                                true
                                        )
                                        .map((instancia, index) => (
                                            <MenuItem
                                                key={index}
                                                value={instancia.instancia}
                                            >
                                                {instancia.instancia}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    sx={{ marginTop: "16px" }}
                                    label="Tempo de delay entre as mensagens (Seg.)"
                                    fullWidth
                                    value={deley}
                                    onChange={(e) => setDeley(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={3} md={4}>
                                <TextField
                                    fullWidth
                                    label="DDD"
                                    value={ddd}
                                    onChange={(e) => setDdd(e.target.value)}
                                    error={errorDdd}
                                    helperText={errorDdd && "Preencha o DDD"}
                                    required
                                    inputProps={{ maxLength: 2 }}
                                />
                            </Grid>
                            <Grid item xs={9} md={8}>
                                <TextField
                                    value={telefone}
                                    onChange={(e) =>
                                        setTelefone(e.target.value)
                                    }
                                    fullWidth
                                    label="Telefone"
                                    error={errorTelefone}
                                    helperText={
                                        errorTelefone && "Preencha o telefone"
                                    }
                                    required
                                    inputProps={{ maxLength: 9 }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    onClick={handleAdicionarTelefone}
                                >
                                    Adicionar
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={7}>
                        <Typography variant="button" color="primary">
                            Números Adicionados
                        </Typography>
                        <Box sx={{ height: 170 }}>
                            <List
                                dense
                                sx={{
                                    backgroundColor: "#ecf0f1",
                                    borderRadius: 1,
                                    height: "100%",
                                    overflow: "auto",
                                }}
                            >
                                {numerosAdicionados.map((numero, index) => (
                                    <ListItem
                                        key={index}
                                        secondaryAction={
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                onClick={() =>
                                                    handleDeleteNumero(index)
                                                }
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText primary={numero} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Mensagem"
                            multiline
                            fullWidth
                            placeholder="Escreva sua mensagem..."
                            value={mensagem}
                            onChange={(e) => {
                                setMensagem(e.target.value);
                                setErrorMensagem(false);
                            }}
                            rows={2}
                            sx={{ marginTop: "16px" }}
                            error={errorMensagem}
                            helperText={errorMensagem && "Digite uma mensagem"}
                        />
                    </Grid>
                </Grid>
                <Button
                    sx={{ marginTop: 2, width: { xs: "100%", md: "250px" } }}
                    variant="contained"
                    color="success"
                    onClick={handleEnviar}
                >
                    {loading ? (
                        <CircularProgress size={25} color="inherit" />
                    ) : (
                        "Salvar & Enviar"
                    )}
                </Button>
            </Paper>
        </Container>
    );
}
