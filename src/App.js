import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/pt-br";
import "react-toastify/dist/ReactToastify.css";
import { SnackbarProvider } from "notistack";
import ReportComplete from "./components/ReportComplete";

import RoutesApp from "./routes";

import AuthProvider from "./contexts/auth";
import InterProvider from "./contexts/inter";
import WhatsAppProvider from "./contexts/whatsapp";

const theme = createTheme({
    typography: {
        fontFamily: "Roboto",
    },
});

function App() {
    useEffect(() => {
        const metaTag = document.createElement("meta");
        metaTag.name = "viewport";
        metaTag.content =
            "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
        document.head.appendChild(metaTag);

        return () => {
            document.head.removeChild(metaTag);
        };
    }, []);

    return (
        <>
            <BrowserRouter>
                <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale="pt-br"
                >
                    <SnackbarProvider
                        preventDuplicate
                        Components={{
                            reportComplete: ReportComplete,
                        }}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                        }}
                    >
                        <AuthProvider>
                            <WhatsAppProvider>
                                <InterProvider>
                                    <ThemeProvider theme={theme}>
                                        <ToastContainer autoClose={3000} />
                                        <RoutesApp />
                                    </ThemeProvider>
                                </InterProvider>
                            </WhatsAppProvider>
                        </AuthProvider>
                    </SnackbarProvider>
                </LocalizationProvider>
            </BrowserRouter>
        </>
    );
}

export default App;
