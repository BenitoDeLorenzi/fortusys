import { useEffect, useState, useContext } from "react";
import dayjs from "dayjs";
import {
    Container,
    Paper,
    Grid,
    Box,
    Typography,
    Button,
    Chip,
    IconButton,
    Drawer,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Stack,
    Tooltip,
    CircularProgress,
} from "@mui/material";

import Summary from "./Sumario";

import MultipleSelect from "../../components/MultipleSelect";
import Copyright from "../../components/Copyright";
import DialogDelete from "../../components/DiaglogDelete";

import { DataGrid, GridToolbar, ptBR, GridPagination } from "@mui/x-data-grid";

import MuiPagination from "@mui/material/Pagination";

import { DatePicker } from "@mui/x-date-pickers";

import { Link } from "react-router-dom";

import { toast } from "react-toastify";

import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import TimerOffIcon from "@mui/icons-material/TimerOff";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import CloseIcon from "@mui/icons-material/Close";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import { InterContexts } from "../../contexts/inter";
import { sleep } from "../../utils/config";

import { useSnackbar } from "notistack";

export default function BancoInter() {
    const { getToken, getBoletos, getSumario, cancelarBoleto, getPdf } =
        useContext(InterContexts);

    const [page, setPage] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const [itemsPorPagina, setItemsPorPagina] = useState(100);
    const [rows, setRows] = useState([]);

    const [drawerOpen, setDrawerOpen] = useState(false);

    const [filtroDataPor, setFiltroDataPor] = useState([]);
    const [filtroSituacao, setFiltroSituacao] = useState("");
    const [filtroNomePagador, setFiltroNomePagador] = useState("");
    const [filtroCpfCnpj, setFiltroCpfCnpj] = useState("");
    const [filtroSeuNumero, setFiltroSeuNumero] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("");

    const [sumario, setSumario] = useState(null);

    const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);

    const [loadingDelete, setLoadingDelete] = useState(false);

    const [motivoCancelamento, setMotivoCancelamento] = useState("");
    const [errorMotivoCancelamento, setErrorMotivoCancelamento] =
        useState(false);
    const [nossoNumero, setNossoNumero] = useState("");
    const [codigoSolicitacao, setCodigoSolicitacao] = useState("");

    const [dataInicial, setDataInicial] = useState(
        dayjs(new Date()).subtract(2, "year")
    );
    const [dataFinal, setDataFinal] = useState(
        dayjs(new Date()).add(1, "year")
    );

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [params, setParams] = useState({
        dados: {
            dataInicial: dayjs().subtract(2, "year").format("YYYY-MM-DD"),
            dataFinal: dayjs().add(1, "year").format("YYYY-MM-DD"),
            paginacao: { itensPorPagina: itemsPorPagina, paginaAtual: page },
            situacao: "A_RECEBER",
        },
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        handleGetBoletos(params);
    }, []);

    function Pagination({ onPageChange, className }) {
        return (
            <MuiPagination
                color="primary"
                className={className}
                count={pageCount}
                page={page + 1}
                onChange={(event, newPage) => {
                    const novaPagina = newPage - 1;
                    setPage(novaPagina);

                    const updatedParams = {
                        ...params,
                        dados: {
                            ...params.dados,
                            paginacao: {
                                ...params.dados.paginacao,
                                paginaAtual: novaPagina,
                            },
                        },
                    };

                    handleGetBoletos(updatedParams);
                }}
            />
        );
    }

    function CustomPagination(props) {
        return <GridPagination ActionsComponent={Pagination} {...props} />;
    }

    async function handleGetBoletos(newParams) {
        setLoading(true);
        const token = await getToken();
        newParams.token = token;

        const result = await getBoletos(newParams);

        if (result) {
            localStorage.setItem(
                "@TokenInter",
                JSON.stringify({
                    ...result.token,
                    created: new Date(),
                })
            );

            setPageCount(result.dados.totalPaginas);

            let lista = [];

            const boletos = result.dados.cobrancas;

            boletos.forEach((element, index) => {
                const cobranca = element.cobranca;
                const pagador = element.cobranca.pagador;
                const boleto = element.boleto;

                lista.push({
                    id: index,
                    seuNumero: cobranca.seuNumero,
                    pagador: pagador.nome,
                    emissao: dayjs(cobranca.dataEmissao).format("DD/MM/YYYY"),
                    vencimento: dayjs(cobranca.dataVencimento).format(
                        "DD/MM/YYYY"
                    ),
                    valor: "R$ " + cobranca.valorNominal,
                    situacao: cobranca.situacao,
                    nossoNumero: boleto.nossoNumero,
                    codigoSolicitacao: cobranca.codigoSolicitacao,
                });
            });
            setRows(lista);
            await handleGetSumario(params);
        }

        setLoading(false);
    }

    const handleGetSumario = async () => {
        const result = await getSumario(params);
        setSumario(result.dados);
    };

    const handleFilter = async () => {
        params.dados.dataInicial = dayjs(dataInicial).format("YYYY-MM-DD");
        params.dados.dataFinal = dayjs(dataFinal).format("YYYY-MM-DD");
        params.dados.filtrarDataPor = filtroDataPor.join(" ");
        params.dados.situacao = filtroSituacao;
        params.dados.pessoaPagadora = filtroNomePagador;
        if (filtroCpfCnpj === "") {
            delete params.dados.cpfCnpjPessoaPagadora;
        } else {
            params.dados.cpfCnpjPessoaPagadora = filtroCpfCnpj;
        }
        params.dados.seuNumero = filtroSeuNumero;
        params.dados.tipoCobranca = filtroTipo;

        await handleGetBoletos(params);
        await handleGetSumario(params);
        setDrawerOpen(false);
        setPage(0);
    };

    const resetFilter = () => {
        setDataInicial(dayjs(new Date()).subtract(2, "year"));
        setDataFinal(dayjs(new Date()).add(5, "year"));
        setFiltroDataPor([]);
        setFiltroSituacao("");
        setFiltroNomePagador("");
        setFiltroCpfCnpj("");
        setFiltroSeuNumero("");
        setFiltroTipo("");
    };

    const handleAcaoBoleto = async (row, acao) => {
        setMotivoCancelamento("");
        setNossoNumero(row.nossoNumero);
        setCodigoSolicitacao(row.codigoSolicitacao);

        if (acao === "cancelar") {
            setDialogDeleteOpen(true);
        } else if (acao === "pdf") {
            enqueueSnackbar("Baixando pdf", {
                variant: "info",
                persist: true,
            });

            const fileName =
                row.pagador +
                "_" +
                row.seuNumero +
                "_" +
                row.nossoNumero +
                ".pdf";

            const lista = row.codigoSolicitacao
                ? [row.codigoSolicitacao]
                : [row.nossoNumero];

            const url = await getPdf(fileName, lista);
            const link = document.createElement("a");
            link.href = url.link;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            closeSnackbar();
        }
    };

    const handleConfirmDelete = async () => {
        let result;

        if (motivoCancelamento === "") {
            setErrorMotivoCancelamento(true);
        } else {
            setErrorMotivoCancelamento(false);
            setLoadingDelete(true);

            result = await cancelarBoleto(
                nossoNumero,
                codigoSolicitacao,
                motivoCancelamento
            );

            if (result) {
                await sleep(7000);
                await handleGetBoletos(params);
                setDialogDeleteOpen(false);
                toast.success("Boleto cancelado com sucesso");
            } else {
                toast.error("Erro ao cancelar o boleto");
            }
        }
        setLoadingDelete(false);
    };

    const columns = [
        { field: "id", headerName: "ID" },
        { field: "seuNumero", headerName: "Seu Numero", width: 115 },
        { field: "nossoNumero", headerName: "Nosso Numero", width: 150 },
        { field: "pagador", headerName: "Pagador", flex: 1 },
        { field: "emissao", headerName: "Emissao" },
        { field: "vencimento", headerName: "Vencimento" },
        { field: "valor", headerName: "Valor", width: 150 },
        {
            field: "situacao",
            headerName: "Situação",
            width: 150,
            renderCell: ({ row }) => {
                if (row.situacao === "RECEBIDO") {
                    return (
                        <Chip
                            size="small"
                            label="Recebido"
                            icon={<TaskAltIcon />}
                            color="success"
                        />
                    );
                } else if (row.situacao === "A_RECEBER") {
                    return (
                        <Chip
                            size="small"
                            label="A Receber"
                            icon={<ErrorOutlineIcon />}
                            color="info"
                        />
                    );
                } else if (row.situacao === "MARCADO_RECEBIDO") {
                    return (
                        <Chip
                            size="small"
                            label="Recebido"
                            icon={<TaskAltIcon />}
                            color="success"
                        />
                    );
                } else if (row.situacao === "ATRASADO") {
                    return (
                        <Chip
                            size="small"
                            label="Atrasado"
                            icon={<EventBusyIcon />}
                            color="warning"
                        />
                    );
                } else if (row.situacao === "CANCELADO") {
                    return (
                        <Chip
                            size="small"
                            label="Cancelado"
                            icon={<HighlightOffIcon />}
                            color="error"
                        />
                    );
                } else if (row.situacao === "EXPIRADO") {
                    return (
                        <Chip
                            size="small"
                            label="Expirado"
                            icon={<TimerOffIcon />}
                            sx={{ backgroundColor: "#bdc3c7" }}
                        />
                    );
                }
            },
        },
        {
            field: "acoes",
            headerName: "Ações",
            width: 150,
            renderCell: ({ row }) => {
                return (
                    <Box sx={{ display: "flex", width: "100%" }}>
                        {row.situacao !== "CANCELADO" &&
                            row.situacao !== "RECEBIDO" &&
                            row.situacao !== "MARCADO_RECEBIDO" && (
                                <Tooltip title="Cancelar" placement="top" arrow>
                                    <IconButton
                                        onClick={() => {
                                            handleAcaoBoleto(row, "cancelar");
                                        }}
                                    >
                                        <DeleteIcon
                                            color="error"
                                            fontSize="small"
                                        />
                                    </IconButton>
                                </Tooltip>
                            )}
                        <Tooltip title="Baixar boleto" placement="top" arrow>
                            <IconButton
                                onClick={() => {
                                    handleAcaoBoleto(row, "pdf");
                                }}
                            >
                                <PictureAsPdfIcon
                                    color="inherit"
                                    fontSize="small"
                                />
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            },
        },
    ];

    return (
        <Container>
            <Paper elevation={5} sx={{ display: "flex", margin: "15px 0" }}>
                <Grid container spacing={2} padding={2}>
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                width: "100%",
                                marginBottom: 1,
                            }}
                        >
                            <Stack
                                spacing={1}
                                direction={{ xs: "column", md: "row" }}
                                sx={{ width: "100%" }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        width: "100%",
                                        justifyContent: {
                                            xs: "center",
                                            md: "start",
                                        },
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography
                                        component="h2"
                                        variant="h6"
                                        color="primary"
                                    >
                                        Lista de boletos
                                    </Typography>
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        width: "100%",
                                        justifyContent: {
                                            xs: "spaece-between",
                                            md: "end",
                                        },
                                        alignItems: "center",
                                    }}
                                >
                                    <Link
                                        to="/novoBoleto"
                                        style={{ textDecoration: "none" }}
                                    >
                                        <Button
                                            variant="contained"
                                            color="success"
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginLeft: 1,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    width: "100%",
                                                }}
                                            >
                                                <AddCircleOutlineIcon
                                                    sx={{ fontSize: 25, mr: 1 }}
                                                />
                                                Novo boleto
                                            </Box>
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginLeft: 1,
                                        }}
                                        onClick={() =>
                                            setDrawerOpen(!drawerOpen)
                                        }
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <FilterAltIcon
                                                sx={{ fontSize: 25, mr: 1 }}
                                            />
                                            Filtros
                                        </Box>
                                    </Button>
                                </Box>
                            </Stack>
                        </Box>
                        <Divider />
                    </Grid>

                    <Grid container>
                        <Grid item xs={12} md={4}>
                            <Summary
                                sumario={sumario}
                                handleGetSumario={handleGetSumario}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>

            <Paper elevation={5} sx={{ width: "100%", height: "550px" }}>
                <DataGrid
                    density="compact"
                    loading={loading}
                    localeText={
                        ptBR.components.MuiDataGrid.defaultProps.localeText
                    }
                    slots={{
                        toolbar: GridToolbar,
                        pagination: CustomPagination,
                    }}
                    rows={rows}
                    columns={columns}
                    pagination
                    disableSelectionOnClick
                    filterMode="server"
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: itemsPorPagina },
                        },
                        sorting: {
                            sortModel: [{ field: "seuNumero", sort: "desc" }],
                        },
                    }}
                    pageSizeOptions={[25, 50, 100]}
                    onPaginationModelChange={(value) => {
                        console.log(value);
                        setItemsPorPagina(value.pageSize);
                    }}
                    columnVisibilityModel={{
                        id: false,
                    }}
                />
            </Paper>
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(!drawerOpen)}
                ModalProps={{
                    BackdropProps: {
                        style: { backgroundColor: "transparent" },
                    },
                }}
                sx={{
                    width: 400,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: 400,
                        boxSizing: "border-box",
                    },
                }}
            >
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <IconButton
                                sx={{ marginRight: 1 }}
                                onClick={() => setDrawerOpen(false)}
                            >
                                <CloseIcon />
                            </IconButton>
                            <Typography
                                component="h2"
                                variant="h6"
                                color="primary"
                            >
                                Filtros
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexGrow: 1,
                                    justifyContent: "end",
                                    alignItems: "center",
                                }}
                            >
                                <Button onClick={resetFilter} color="error">
                                    <RotateLeftIcon /> Reset
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                    <Divider />
                    <Grid item xs={12}>
                        <Typography
                            color="inherit"
                            variant="overline"
                            fontSize={15}
                            fontWeight={500}
                        >
                            Datas
                        </Typography>
                        <Box sx={{ display: "flex", width: "100%" }}>
                            <DatePicker
                                label="Data inicial"
                                value={dataInicial}
                                onChange={(newValue) =>
                                    setDataInicial(newValue)
                                }
                                sx={{ marginRight: 1 }}
                            />
                            <DatePicker
                                label="Data final"
                                value={dataFinal}
                                onChange={(newValue) => setDataFinal(newValue)}
                                sx={{ marginLeft: 1 }}
                            />
                        </Box>

                        <Box sx={{ m: "10px 0" }}>
                            <MultipleSelect
                                value={filtroDataPor}
                                setValue={setFiltroDataPor}
                                items={["VENCIMENTO", "EMISSAO", "PAGAMENTO"]}
                                label="Data por"
                            />
                        </Box>
                    </Grid>
                    <Divider />
                    <Grid item xs={12}>
                        <Typography
                            color="inherit"
                            variant="overline"
                            fontSize={15}
                            fontWeight={500}
                        >
                            Situação
                        </Typography>

                        <FormControl fullWidth sx={{ marginBottom: "10px" }}>
                            <InputLabel>Situação</InputLabel>
                            <Select
                                value={filtroSituacao}
                                label="Situação"
                                onChange={(e) =>
                                    setFiltroSituacao(e.target.value)
                                }
                            >
                                <MenuItem value="">
                                    <em>Nenhum</em>
                                </MenuItem>
                                <MenuItem value={"RECEBIDO"}>Recebido</MenuItem>
                                <MenuItem value={"A_RECEBER"}>
                                    A Receber
                                </MenuItem>
                                <MenuItem value={"MARCADO_RECEBIDO"}>
                                    Marcado Recebido
                                </MenuItem>
                                <MenuItem value={"ATRASADO"}>Atrasado</MenuItem>
                                <MenuItem value={"CANCELADO"}>
                                    Cancelado
                                </MenuItem>
                                <MenuItem value={"EXPIRADO"}>Expirado</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Divider />
                    <Grid item xs={12}>
                        <Typography
                            color="inherit"
                            variant="overline"
                            fontSize={15}
                            fontWeight={500}
                        >
                            Pagador
                        </Typography>
                        <TextField
                            sx={{ marginBottom: "10px" }}
                            fullWidth
                            label="Nome"
                            variant="outlined"
                            value={filtroNomePagador}
                            onChange={(e) =>
                                setFiltroNomePagador(e.target.value)
                            }
                        />
                        <TextField
                            sx={{ marginBottom: "10px" }}
                            fullWidth
                            label="Cpf/Cnpj"
                            variant="outlined"
                            value={filtroCpfCnpj}
                            onChange={(e) => {
                                setFiltroCpfCnpj(e.target.value);
                            }}
                        />
                    </Grid>
                    <Divider />
                    <Grid item xs={12}>
                        <Typography
                            color="inherit"
                            variant="overline"
                            fontSize={15}
                            fontWeight={500}
                        >
                            Boleto
                        </Typography>
                        <TextField
                            sx={{ marginBottom: "10px" }}
                            fullWidth
                            label="Seu Numero"
                            variant="outlined"
                            value={filtroSeuNumero}
                            onChange={(e) => setFiltroSeuNumero(e.target.value)}
                        />
                        <FormControl fullWidth sx={{ marginBottom: "10px" }}>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={filtroTipo}
                                label="Tipo"
                                onChange={(e) => setFiltroTipo(e.target.value)}
                            >
                                <MenuItem value="">
                                    <em>Nenhum</em>
                                </MenuItem>
                                <MenuItem value={"SIMPLES"}>Simples</MenuItem>
                                <MenuItem value={"PARCELADO"}>
                                    Parcelado
                                </MenuItem>
                                <MenuItem value={"RECORRENTE"}>
                                    Recorrente
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Box width="100%" m="20px 0">
                        <Button
                            onClick={handleFilter}
                            fullWidth
                            variant="contained"
                        >
                            Filtrar
                        </Button>
                    </Box>
                </Box>
            </Drawer>
            <Copyright />
            <DialogDelete
                open={dialogDeleteOpen}
                handleClose={() => {
                    setDialogDeleteOpen(!dialogDeleteOpen);
                }}
                motivoCancelamento={motivoCancelamento}
                setMotivoCancelamento={setMotivoCancelamento}
                handleConfirmDelete={handleConfirmDelete}
                loading={loadingDelete}
                error={errorMotivoCancelamento}
                title="Deseja cancelar esse boleto?"
                text="Tem certeza que deseja excluir esse boleto? Forneça um motivo"
            />
        </Container>
    );
}
