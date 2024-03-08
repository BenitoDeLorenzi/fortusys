import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";

function InputCpfCnpj({ value, onChange, error, helperText, ...other }) {
    const [formattedValue, setFormattedValue] = useState("");

    useEffect(() => {
        formatValue(value);
    }, [value]);

    const formatValue = (val) => {
        const originalValue = val.replace(/\D/g, "");
        let formattedValue;

        // Limita o valor original a no máximo 11 dígitos para CPF ou 14 para CNPJ
        const limitedValue = originalValue.substring(0, 14);

        if (limitedValue.length <= 11) {
            formattedValue = limitedValue
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        } else {
            formattedValue = limitedValue
                .replace(/^(\d{2})(\d)/, "$1.$2")
                .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
                .replace(/\.(\d{3})(\d)/, ".$1/$2")
                .replace(/(\d{4})(\d)/, "$1-$2");
        }

        setFormattedValue(formattedValue);
    };

    const handleChangeInternal = (event) => {
        const newValue = event.target.value.replace(/\D/g, "");
        formatValue(newValue);

        if (onChange) {
            onChange({
                ...event,
                target: {
                    ...event.target,
                    value: newValue, // Atualizado para passar o valor limpo
                    name: "cpfCnpj", // Inclui o nome do campo
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
            label="CPF ou CNPJ"
            name="cpfCnpj"
            fullWidth
        />
    );
}

export default InputCpfCnpj;
