import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    CircularProgress,
} from "@mui/material";

const DialogDelete = ({
    open,
    handleClose,
    motivoCancelamento,
    setMotivoCancelamento,
    handleConfirmDelete,
    loading,
    error,
    title,
    text,
}) => {
    const handleReasonChange = (event) => {
        setMotivoCancelamento(event.target.value);
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
        >
            <DialogTitle id="delete-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText mb={2} id="delete-dialog-description">
                    {text}
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="reason"
                    label="Motivo"
                    type="text"
                    fullWidth
                    value={motivoCancelamento}
                    onChange={handleReasonChange}
                    required
                    error={error}
                    helperText={error && "Preencha o motivo"}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancelar
                </Button>
                <Button onClick={handleConfirmDelete} color="error">
                    {loading ? (
                        <CircularProgress size={25} color="primary" />
                    ) : (
                        "Excluir"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DialogDelete;
