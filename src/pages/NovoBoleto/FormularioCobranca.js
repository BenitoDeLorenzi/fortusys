import React, { useState, useEffect } from "react";
import {
    Grid,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import "moment/locale/pt-br";

import InputValor from "../../components/InputValor";

moment.locale("pt-br");

const FormularioCobranca = ({ cobranca, errors, handleChange }) => {
    const [numParcelas, setNumParcelas] = useState(cobranca.parcelas);
    const [selectedDate, setSelectedDate] = useState(moment().add(1, "month"));

    const handleParcelasChange = (e) => {
        setNumParcelas(e.target.value);
        handleChange(e);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        const event = {
            target: {
                value: moment(date).format("YYYY-MM-DD"),
                name: "dataVencimento",
            },
        };
        handleChange(event);
    };

    return (
        <Grid container spacing={1.5}>
            <Grid item xs={12} md={6}>
                <FormControl required fullWidth error={!!errors.seuNumero}>
                    <InputLabel>Departamento</InputLabel>
                    <Select
                        name="seuNumero"
                        value={cobranca.seuNumero.substring(0, 3)}
                        onChange={handleChange}
                        label="Departamento"
                    >
                        <MenuItem value="">Nenhum</MenuItem>
                        <MenuItem value="MGF">Magazine Fortulino</MenuItem>
                        <MenuItem value="MKT">Marketing</MenuItem>
                        <MenuItem value="HJZ">Jorge Fortulino</MenuItem>
                        <MenuItem value="HFF">Holding Fortulino</MenuItem>
                    </Select>
                    {errors.seuNumero && (
                        <FormHelperText>{errors.seuNumero}</FormHelperText>
                    )}
                </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Seu Número"
                    value={cobranca.seuNumero}
                    disabled
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <InputValor
                    value={cobranca.valorNominal}
                    onChange={handleChange}
                    error={!!errors.valorNominal}
                    helperText={errors.valorNominal}
                    name="valorNominal"
                    label="Valor (R$)"
                    required
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                    <InputLabel>Parcelas</InputLabel>
                    <Select
                        name="parcelas"
                        value={numParcelas}
                        onChange={handleParcelasChange}
                        label="Parcelas"
                    >
                        {Array.from({ length: 10 }, (_, index) => (
                            <MenuItem key={index} value={index + 1}>
                                {`${index + 1} x R$ ${parseFloat(
                                    cobranca.valorNominal / (index + 1)
                                ).toFixed(2)}`}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                        name="dataVencimento"
                        label="Data vencimento"
                        value={selectedDate}
                        onChange={(newValue) => handleDateChange(newValue)}
                        format="DD/MM/YYYY"
                    />
                </LocalizationProvider>
            </Grid>
        </Grid>
    );
};

export default FormularioCobranca;
