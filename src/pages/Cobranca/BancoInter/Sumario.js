import { useContext, useEffect, useState } from "react";
import { Paper, Grid, Typography, Box, Chip } from "@mui/material";

import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import TimerOffIcon from "@mui/icons-material/TimerOff";

export default function Summary({ sumario }) {
    const somaValoresEQuantidades = () => {
        let totalValor = 0;
        let totalQuantidade = 0;
        for (const item of sumario) {
            totalValor += item.valor;
            totalQuantidade += item.quantidade;
        }
        return { valor: totalValor, quantidade: totalQuantidade };
    };

    let dados;
    if (sumario) {
        if (sumario.length === 1) {
            dados = sumario[0];
        } else {
            const { valor, quantidade } = somaValoresEQuantidades();
            dados = { situacao: "TODOS", valor, quantidade };
        }
    }

    const formatValue = (value) => {
        return parseFloat(value).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    const renderSituacao = (situacao) => {
        if (situacao === "RECEBIDO") {
            return (
                <Chip
                    size="small"
                    label="Recebido"
                    icon={<TaskAltIcon />}
                    color="success"
                />
            );
        } else if (situacao === "A_RECEBER") {
            return (
                <Chip
                    size="small"
                    label="A Receber"
                    icon={<ErrorOutlineIcon />}
                    color="info"
                />
            );
        } else if (situacao === "MARCADO_RECEBIDO") {
            return (
                <Chip
                    size="small"
                    label="Recebido"
                    icon={<TaskAltIcon />}
                    color="success"
                />
            );
        } else if (situacao === "ATRASADO") {
            return (
                <Chip
                    size="small"
                    label="Atrasado"
                    icon={<EventBusyIcon />}
                    color="warning"
                />
            );
        } else if (situacao === "CANCELADO") {
            return (
                <Chip
                    size="small"
                    label="Cancelado"
                    icon={<HighlightOffIcon />}
                    color="error"
                />
            );
        } else if (situacao === "EXPIRADO") {
            return (
                <Chip
                    size="small"
                    label="Expirado"
                    icon={<TimerOffIcon />}
                    sx={{ backgroundColor: "#bdc3c7" }}
                />
            );
        }
    };

    return (
        <Box sx={{ padding: "0 16px" }}>
            <Grid container>
                <Grid item xs={6}>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                        Valor total:
                        <Typography variant="h6" fontSize={18}>
                            {dados && formatValue(dados.valor)}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                        Quantidade:
                        <Typography variant="h6" fontSize={18}>
                            {dados && dados.quantidade}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
