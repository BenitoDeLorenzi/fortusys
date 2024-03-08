import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";

function InputCep({ value, onChange, error, helperText, ...other }) {
    const [formattedValue, setFormattedValue] = useState("");

    useEffect(() => {
        formatValue(value);
    }, [value]);

    // Função para formatar o valor como CEP
    const formatValue = (val) => {
        const originalValue = val.replace(/\D/g, ""); // Remove qualquer coisa que não seja dígito
        const formattedValue = originalValue
            .replace(/(\d{5})(\d)/, "$1-$2") // Aplica a máscara de CEP
            .substring(0, 9); // Limita o tamanho máximo do CEP a 9 caracteres (incluindo o hífen)

        setFormattedValue(formattedValue);
    };

    const handleChangeInternal = (event) => {
        const newValue = event.target.value.replace(/\D/g, ""); // Limpa o valor para manter apenas dígitos
        formatValue(newValue); // Formata o valor

        if (onChange) {
            onChange({
                ...event,
                target: {
                    ...event.target,
                    value: newValue, // Passa o valor limpo
                    name: "cep", // Define o nome do campo
                },
            });
        }
    };

    return (
        <TextField
            {...other}
            value={formattedValue}
            onChange={handleChangeInternal}
            error={error}
            helperText={helperText}
            label="CEP"
            name="cep"
            fullWidth
        />
    );
}

export default InputCep;
