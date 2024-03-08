import React, { useState, useContext } from "react";
import {
    Box,
    Grid,
    Typography,
    TextField,
    Button,
    Paper,
    InputAdornment,
    Link,
    CircularProgress,
} from "@mui/material";

import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";

import Copyright from "../../components/Copyright";

import { AuthContexts } from "../../contexts/auth";

const SignUp = () => {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ nome: "", email: "", password: "" });

    const { signUp, loadingAuth } = useContext(AuthContexts);

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleNomeChange = (event) => {
        setNome(event.target.value);
        if (event.target.value) {
            setErrors((prevErrors) => ({ ...prevErrors, nome: "" }));
        }
    };

    const handleEmailChange = (event) => {
        const emailValue = event.target.value;
        setEmail(emailValue);
        if (!emailValue) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                email: "E-mail é obrigatório.",
            }));
        } else if (!isValidEmail(emailValue)) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                email: "Digite um e-mail válido.",
            }));
        } else {
            setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
        }
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
        if (event.target.value) {
            setErrors((prevErrors) => ({ ...prevErrors, password: "" }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        let hasErrors = false;
        let newErrors = { nome: "", email: "", password: "" };

        if (!nome) {
            hasErrors = true;
            newErrors.nome = "Nome é obrigatório.";
        }

        if (!email) {
            hasErrors = true;
            newErrors.email = "E-mail é obrigatório.";
        } else if (!isValidEmail(email)) {
            hasErrors = true;
            newErrors.email = "Digite um e-mail válido.";
        }

        if (!password) {
            hasErrors = true;
            newErrors.password = "Senha é obrigatória.";
        }

        setErrors(newErrors);
        if (!hasErrors) {
            await signUp(email, password, nome);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100vh",
                padding: { xs: 3, md: 0 },
            }}
        >
            <Paper
                elevation={12}
                sx={{ borderRadius: "10px", width: "1350px" }}
            >
                <Grid container>
                    <Grid
                        item
                        xs={false}
                        sm={7}
                        sx={{
                            background: "#1565C0", // Ajuste para a cor exata do design
                            color: "white",
                            display: { xs: "none", sm: "flex" },
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: 8, // theme.spacing(8)
                            borderRadius: "10px 0 0 10px",
                            height: "700px",
                        }}
                    >
                        <img
                            alt="Logo"
                            src="/images/logo-escrita-white.png"
                            style={{ width: "350px" }}
                        />
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={5}
                        sx={{
                            padding: { xs: 4, md: 7 },
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: { xs: "center", md: "left" },
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", md: "row" },
                                justifyContent: "space-between",
                                alignItems: { xs: "flex-start", md: "center" },
                                width: "100%",
                            }}
                        >
                            <Typography
                                sx={{
                                    textAlign: { xs: "center", md: "left" },
                                    fontSize: 40,
                                }}
                                variant="h6"
                            >
                                Registrar
                            </Typography>
                            <Box sx={{ padding: { xs: 1, md: 0 } }}>
                                <Typography variant="h6" fontSize={15}>
                                    Já tem uma conta?
                                </Typography>
                                <Link href="/" variant="body2" fontSize={20}>
                                    {"Entrar"}
                                </Link>
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                padding: { xs: 1, md: 0 },
                                display: "flex",
                                flexDirection: "column",
                                alignItems: {
                                    xs: "center",
                                    md: "flex-start",
                                },
                                width: "100%",
                            }}
                        ></Box>

                        <Box
                            component="form"
                            noValidate
                            onSubmit={handleSubmit}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                width: "100%",
                                flexGrow: 1,
                                marginTop: { xs: 0, md: 2 },
                            }}
                        >
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="nome"
                                label="Nome e Sobrenome"
                                name="nome"
                                autoComplete="nome"
                                autoFocus
                                value={nome}
                                onChange={handleNomeChange}
                                error={!!errors.nome}
                                helperText={errors.nome}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="Digite seu nome"
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Endereço de Email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                onChange={handleEmailChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="Digite seu E-mail"
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Senha"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={handlePasswordChange}
                                error={!!errors.password}
                                helperText={errors.password}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="Digite sua Senha"
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    padding: 1.5,
                                    backgroundColor: "#1565C0",
                                    "&:hover": { bgcolor: "#0D47A1" },
                                }}
                            >
                                {loadingAuth ? (
                                    <CircularProgress
                                        color="inherit"
                                        size={20}
                                    />
                                ) : (
                                    "Registrar"
                                )}
                            </Button>
                            <Copyright />
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default SignUp;
