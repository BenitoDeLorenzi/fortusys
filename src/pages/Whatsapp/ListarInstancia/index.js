import React, { useState, useEffect, useContext } from "react";
import {
    Container,
    Paper,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Box,
    Modal,
    Button,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import DeleteIcon from "@mui/icons-material/Delete";

import { WhatsAppContexts } from "../../../contexts/whatsapp";

import moment from "moment";

import { toast } from "react-toastify";

import { sleep } from "../../../utils/config";

export default function WhatsAppListarInstancia() {
    const { wppListarInstancias, wppDeletarInstancia, wppQrCode, wppStatus } =
        useContext(WhatsAppContexts);

    const [selectedInstance, setSelectedInstance] = useState("");
    const [qrCode, setQrCode] = useState(null);
    const [showQRCodeModal, setShowQRCodeModal] = useState(false);
    const [instancias, setInstancias] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        handleListarInstancias();
    }, []);

    async function handleListarInstancias() {
        const result = await wppListarInstancias();
        setInstancias(result);
    }

    const handleMenuClick = (event, instancia) => {
        setSelectedInstance(instancia);
        setAnchorEl(event.currentTarget);
    };

    const handleGerarQrCode = async () => {
        const result = await wppQrCode(selectedInstance);
        loopStatus(selectedInstance);
        setQrCode(result);
        setShowQRCodeModal(true);
        handleCloseMenu();
    };

    async function loopStatus(instancia) {
        let continuarLoop = true;
        while (continuarLoop) {
            const resultado = await wppStatus(instancia);
            if (resultado.success === true) {
                continuarLoop = false;
                setShowQRCodeModal(false);
                handleListarInstancias();
            } else {
                await sleep(5000);
            }
        }
    }

    const handleDeletarInstancia = async () => {
        await wppDeletarInstancia(selectedInstance).then((result) => {
            if (result.success) {
                toast.success(result.message);
                handleListarInstancias();
            } else {
                toast.error(result.message);
            }
        });

        handleCloseMenu();
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const handleCloseQRCodeModal = () => {
        setShowQRCodeModal(false);
    };

    const menuOptions = [
        {
            label: "Gerar QR Code",
            icon: <QrCodeScannerIcon />,
            action: handleGerarQrCode,
            disabled: instancias.find(
                (instancia) => instancia.instancia === selectedInstance
            )?.status.success,
        },
        {
            label: "Deletar",
            icon: <DeleteIcon />,
            action: handleDeletarInstancia,
        },
    ];

    return (
        <Container>
            <Paper
                elevation={2}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    padding: 2,
                }}
            >
                <Typography variant="h6" color="primary">
                    Listar instância
                </Typography>
            </Paper>
            <TableContainer sx={{ marginTop: 1 }} component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>NOME DA INSTÂNCIA</TableCell>
                            <TableCell>CLIENTE</TableCell>
                            <TableCell>PLATAFORMA</TableCell>
                            <TableCell>DATA CRIAÇÃO</TableCell>
                            <TableCell align="center">STATUS</TableCell>
                            <TableCell align="center">AÇÕES</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {instancias.map((row) => (
                            <TableRow
                                key={row.instancia}
                                sx={{
                                    "&:last-child td, &:last-child th": {
                                        border: 0,
                                    },
                                }}
                            >
                                <TableCell component="th" scope="row">
                                    {row.instancia}
                                </TableCell>
                                <TableCell>
                                    {row.info?.pushname +
                                        " / " +
                                        row.info?.wid.user}
                                </TableCell>
                                <TableCell>{row.info?.platform}</TableCell>
                                <TableCell>
                                    {moment(row.createdAt.toDate()).format(
                                        "DD/MM/YYYY"
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    {row?.status.success ? (
                                        <Chip
                                            icon={<CheckCircleIcon />}
                                            label="Conectado"
                                            color="success"
                                        />
                                    ) : (
                                        <Chip
                                            icon={<CancelIcon />}
                                            label="Desconectado"
                                            color="error"
                                        />
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        aria-label="menu"
                                        onClick={(event) =>
                                            handleMenuClick(
                                                event,
                                                row.instancia
                                            )
                                        }
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                    <Menu
                                        id="actions-menu"
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleCloseMenu}
                                        anchorOrigin={{
                                            vertical: "bottom",
                                            horizontal: "right",
                                        }}
                                        transformOrigin={{
                                            vertical: "top",
                                            horizontal: "right",
                                        }}
                                    >
                                        {menuOptions.map((option, index) => (
                                            <MenuItem
                                                key={index}
                                                onClick={() => {
                                                    option.action();
                                                }}
                                                disabled={option.disabled}
                                            >
                                                {option.icon}
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Modal
                open={showQRCodeModal}
                onClose={handleCloseQRCodeModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "white",
                        border: "2px solid #000",
                        boxShadow: 24,
                        p: 4,
                        maxWidth: 400,
                    }}
                >
                    {qrCode && <img src={qrCode} alt="WhatsApp QR Code" />}
                    <Button
                        onClick={() => {
                            handleGerarQrCode();
                        }}
                    >
                        Recarregar
                    </Button>
                </Box>
            </Modal>
        </Container>
    );
}
