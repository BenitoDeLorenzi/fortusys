import React, { useState, forwardRef, useCallback } from "react";
import clsx from "clsx";
import { useSnackbar, SnackbarContent } from "notistack";
import Collapse from "@mui/material/Collapse";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const ReportComplete = forwardRef(({ id, message, download }, ref) => {
    const { closeSnackbar } = useSnackbar();
    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = useCallback(() => {
        setExpanded((oldExpanded) => !oldExpanded);
    }, []);

    const handleDismiss = useCallback(() => {
        closeSnackbar(id);
    }, [id, closeSnackbar]);

    const handleDownload = () => {
        console.log(download);
        window.open(download, "_blank");
    };

    return (
        <SnackbarContent ref={ref} sx={{ minWidth: { sm: "344px" } }}>
            <Card sx={{ width: "100%", backgroundColor: "#fddc6c" }}>
                <CardActions
                    sx={{
                        padding: "8px 8px 8px 16px",
                        justifyContent: "space-between",
                    }}
                >
                    <Typography variant="body2" sx={{ color: "#000" }}>
                        {message}
                    </Typography>
                    <div>
                        <IconButton
                            aria-label="Show more"
                            size="small"
                            sx={{
                                padding: "8px",
                                transform: expanded
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                color: "#000",
                                transition: "all .2s",
                            }}
                            onClick={handleExpandClick}
                        >
                            <ExpandMoreIcon />
                        </IconButton>
                        <IconButton
                            size="small"
                            sx={{ padding: "8px", color: "#000" }}
                            onClick={handleDismiss}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </div>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Paper sx={{ backgroundColor: "#fff", padding: 2 }}>
                        <Typography
                            gutterBottom
                            variant="caption"
                            sx={{ color: "#000", display: "block" }}
                        >
                            PDF pronto
                        </Typography>
                        <Button
                            size="small"
                            color="primary"
                            sx={{ padding: 0, textTransform: "none" }}
                            onClick={handleDownload}
                        >
                            <CheckCircleIcon
                                sx={{ fontSize: 20, paddingRight: "4px" }}
                            />
                            Baixar agora
                        </Button>
                    </Paper>
                </Collapse>
            </Card>
        </SnackbarContent>
    );
});

ReportComplete.displayName = "ReportComplete";
export default ReportComplete;
