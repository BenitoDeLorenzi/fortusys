import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";

function InputTelefone({ value, onChange, error, helperText, ...other }) {
    const [formattedValue, setFormattedValue] = useState("");

    useEffect(() => {
        formatValue(value);
    }, [value]);

    // Função para formatar o valor como número de telefone XXXXX-XXXX
    const formatValue = (val) => {
        const originalValue = val.replace(/\D/g, ""); // Remove qualquer coisa que não seja dígito
        // Limita o tamanho máximo dos dígitos a 8 para atender a restrição
        const limitedValue = originalValue.substring(0, 9);
        const formattedValue = limitedValue.replace(/(\d{5})(\d{3})/, "$1-$2"); // Aplica a máscara de telefone

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
                    value: newValue, // Passa o valor limpo e formatado
                    name: "telefone", // Define o nome do campo como 'telefone'
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
            label="Telefone"
            name="telefone"
            fullWidth
        />
    );
}

export default InputTelefone;
