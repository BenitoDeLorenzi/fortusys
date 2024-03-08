// FormularioPagador.js
import React, { useEffect, useState } from "react";
import {
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    Grid,
    CircularProgress,
} from "@mui/material";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import InputCpfCnpj from "../../components/InputCpfCnpj";
import InputCep from "../../components/InputCep";
import InputTelefone from "../../components/InputTelefone";

const FormularioPagador = ({
    pagador,
    setPagador,
    errors,
    setErrorsPagador,
    handleChange,
    handleTipoPessoa,
    loading,
    ufSelected,
    setUfSelected,
}) => {
    const [uf, setUf] = useState([]);

    useEffect(() => {
        getUf();
    }, []);

    const getUf = async () => {
        fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
            .then((response) => response.json())
            .then((estados) => {
                let lista = [];
                estados.forEach((estado) => {
                    lista.push(estado);
                });
                setUf(lista);
            })
            .catch((error) => console.error("Falha ao buscar estados:", error));
    };

    const handleGetCep = async (e) => {
        const cep = e.target.value;
        if (cep !== "") {
            await fetch(`https://viacep.com.br/ws/${cep}/json/`)
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error(
                        "Falha na requisição: " + response.statusText
                    );
                })
                .then((data) => {
                    if (data.erro) {
                        return;
                    }
                    setUfSelected(data.uf);
                    setPagador((prev) => ({
                        ...prev,
                        uf: data.uf,
                        cidade: data.localidade,
                        endereco: data.logradouro,
                        bairro: data.bairro,
                        complemento: data.complemento,
                        cep: cep.replace("-", ""),
                    }));

                    setErrorsPagador((prev) => ({
                        ...prev,
                        uf: null,
                        cidade: null,
                        endereco: null,
                    }));
                })
                .catch((error) =>
                    console.error("Erro ao buscar dados do CEP:", error)
                );
        }
    };

    return (
        <Grid container spacing={1.5} sx={{ width: "100%" }}>
            <Grid item xs={12} md={3}>
                <InputCpfCnpj
                    value={pagador.cpfCnpj}
                    onChange={handleChange}
                    error={!!errors.cpfCnpj}
                    helperText={errors.cpfCnpj}
                    required
                    onBlur={handleTipoPessoa}
                    autoFocus
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <FormControl required fullWidth error={!!errors.tipoPessoa}>
                    <InputLabel>Tipo de Pessoa</InputLabel>
                    <Select
                        name="tipoPessoa"
                        value={pagador.tipoPessoa}
                        onChange={handleChange}
                        label="Tipo de Pessoa"
                    >
                        <MenuItem value="">Nenhum</MenuItem>
                        <MenuItem value="FISICA">Pessoa Física</MenuItem>
                        <MenuItem value="JURIDICA">Pessoa Jurídica</MenuItem>
                    </Select>
                    {errors.tipoPessoa && (
                        <FormHelperText>{errors.tipoPessoa}</FormHelperText>
                    )}
                </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    label="Nome"
                    variant="outlined"
                    name="nome"
                    value={pagador.nome}
                    onChange={handleChange}
                    error={!!errors.nome}
                    helperText={errors.nome}
                    fullWidth
                    required
                />
            </Grid>
            <Grid item xs={8} md={3}>
                <InputCep
                    value={pagador.cep}
                    onChange={handleChange}
                    error={!!errors.cep}
                    helperText={errors.cep}
                    onBlur={handleGetCep}
                    required
                    InputProps={{
                        endAdornment: loading && <CircularProgress size={20} />,
                    }}
                />
            </Grid>
            <Grid item xs={4} md={3}>
                <FormControl required fullWidth error={!!errors.uf}>
                    <InputLabel>UF</InputLabel>
                    <Select
                        name="uf"
                        value={ufSelected}
                        onChange={handleChange}
                        label="Uf"
                        IconComponent={() =>
                            loading ? (
                                <CircularProgress size={24} />
                            ) : (
                                <ArrowDropDownIcon />
                            )
                        }
                    >
                        <MenuItem value="">Nenhum</MenuItem>
                        {uf.map((item, index) => (
                            <MenuItem key={index} value={item.sigla}>
                                {item.sigla}
                            </MenuItem>
                        ))}
                    </Select>
                    {errors.uf && <FormHelperText>{errors.uf}</FormHelperText>}
                </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    label="Cidade"
                    variant="outlined"
                    name="cidade"
                    value={pagador.cidade}
                    onChange={handleChange}
                    error={!!errors.cidade}
                    helperText={errors.cidade}
                    fullWidth
                    required
                    InputProps={{
                        endAdornment: loading && <CircularProgress size={20} />,
                    }}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    label="Bairro"
                    variant="outlined"
                    name="bairro"
                    value={pagador.bairro}
                    onChange={handleChange}
                    error={!!errors.bairro}
                    helperText={errors.bairro}
                    fullWidth
                    InputProps={{
                        endAdornment: loading && <CircularProgress size={20} />,
                    }}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    label="Endereço"
                    variant="outlined"
                    name="endereco"
                    value={pagador.endereco}
                    onChange={handleChange}
                    error={!!errors.endereco}
                    helperText={errors.endereco}
                    fullWidth
                    required
                    InputProps={{
                        endAdornment: loading && <CircularProgress size={20} />,
                    }}
                />
            </Grid>
            <Grid item xs={3} md={2}>
                <TextField
                    label="Numero"
                    variant="outlined"
                    name="numero"
                    value={pagador.numero}
                    onChange={handleChange}
                    error={!!errors.numero}
                    helperText={errors.numero}
                    fullWidth
                />
            </Grid>
            <Grid item xs={9} md={4}>
                <TextField
                    label="Complemento"
                    variant="outlined"
                    name="complemento"
                    value={pagador.complemento}
                    onChange={handleChange}
                    error={!!errors.complemento}
                    helperText={errors.complemento}
                    fullWidth
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <TextField
                    label="Email"
                    variant="outlined"
                    name="email"
                    value={pagador.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    fullWidth
                />
            </Grid>
            <Grid item xs={4} md={2}>
                <TextField
                    label="DDD"
                    variant="outlined"
                    name="ddd"
                    value={pagador.ddd}
                    onChange={handleChange}
                    error={!!errors.ddd}
                    helperText={errors.ddd}
                    fullWidth
                    required
                    inputProps={{
                        maxLength: 2,
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                    }}
                />
            </Grid>
            <Grid item xs={8} md={4}>
                <InputTelefone
                    value={pagador.telefone}
                    onChange={handleChange}
                    error={!!errors.telefone}
                    helperText={errors.telefone}
                    required
                />
            </Grid>
        </Grid>
    );
};

export default FormularioPagador;
