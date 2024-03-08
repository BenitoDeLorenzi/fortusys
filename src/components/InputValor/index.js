import React from "react";
import TextField from "@mui/material/TextField";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

const InputValor = ({
    value,
    onChange,
    onBlur,
    error,
    helperText,
    name,
    label,
    required,
}) => {
    // Função para remover a formatação e retornar apenas os números com ponto decimal
    const toNumber = (value) => {
        return Number(value.replace(/\D/g, "")) / 100;
    };

    // Função para manipular as mudanças no input, removendo a formatação do valor antes de passar para o onChange
    const handleChange = (event) => {
        const { value } = event.target;
        const numberValue = toNumber(value);
        onChange({ target: { name, value: numberValue } });
    };

    const handleBlur = () => {
        if (onBlur) onBlur(); // Chama a função onBlur passada como prop, se existir
    };

    return (
        <TextField
            value={value ? currencyFormatter.format(value) : ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={error}
            helperText={helperText}
            name={name}
            label={label}
            required={required}
            // Para permitir a entrada de valores numéricos e vírgula/ponto
            inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
            }}
            fullWidth
        />
    );
};

export default InputValor;
