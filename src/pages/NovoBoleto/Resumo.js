import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import moment from "moment";

export default function Resumo({ dadosEnvio }) {
    const pagador = dadosEnvio.pagador;
    const cobranca = {
        seuNumero: dadosEnvio.cobranca.seuNumero,
        dataVencimento: moment(dadosEnvio.cobranca.dataVencimento).format(
            "DD/MM/YYYY"
        ),
        parcelas: dadosEnvio.cobranca.parcelas,
        valorNominal: "R$ " + dadosEnvio.cobranca.valorNominal,
        valorParcela: "R$ " + dadosEnvio.cobranca.valorParcela,
    };

    const formatKey = (key) => {
        return key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <Card
                    sx={{
                        minWidth: 275,
                        marginBottom: 2,
                        boxShadow: 3,
                        height: "300px",
                        overflow: "auto",
                    }}
                >
                    <CardContent>
                        <Typography variant="h5" mb={2} color="primary">
                            Pagador
                        </Typography>
                        {Object.entries(pagador).map(([key, value]) => (
                            <Box
                                key={key}
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    borderBottom: "1px solid #CCC",

                                    marginBottom: 1,
                                }}
                            >
                                <Typography variant="body1" component="span">
                                    <strong>{formatKey(key)}:</strong>
                                </Typography>
                                <Typography variant="body1" component="span">
                                    {value}
                                </Typography>
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card
                    sx={{
                        minWidth: 275,
                        marginBottom: 2,
                        boxShadow: 3,
                        height: "300px",
                        overflow: "auto",
                    }}
                >
                    <CardContent>
                        <Typography variant="h5" mb={2} color="primary">
                            Cobranca
                        </Typography>
                        {Object.entries(cobranca).map(([key, value]) => (
                            <Box
                                key={key}
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    borderBottom: "1px solid #CCC",

                                    marginBottom: 1,
                                }}
                            >
                                <Typography variant="body1" component="span">
                                    <strong>{formatKey(key)}:</strong>
                                </Typography>
                                <Typography variant="body1" component="span">
                                    {value}
                                </Typography>
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}
