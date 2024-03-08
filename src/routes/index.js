import { Routes, Route } from "react-router-dom";

import Private from "./Private";
import SignIn from "../pages/SignIn";
import SingUp from "../pages/SignUp";
import Homepage from "../pages/Homepage";
import Profile from "../pages/Profile";
import Dashboard from "../pages/Dashboard";
import ClientesEmAtraso from "../pages/ClienteEmAtraso";
import BancoInter from "../pages/BancoInter";
import NovoBoleto from "../pages/NovoBoleto";
import WhatsAppCriarInstancia from "../pages/Whatsapp/CriarInstancia";
import WhatsAppListarInstancia from "../pages/Whatsapp/ListarInstancia";
import WhatsAppConfig from "../pages/Whatsapp/Config";
import WhatsAppDisparador from "../pages/Whatsapp/Disparador";

export default function RoutesApp() {
    return (
        <Routes>
            <Route path="/" element={<SignIn />} />
            <Route path="/register" element={<SingUp />} />

            <Route
                path="/profile"
                element={
                    <Private>
                        <Homepage title="Meu perfil">
                            <Profile />
                        </Homepage>
                    </Private>
                }
            />
            <Route
                path="/dashboard"
                element={
                    <Private>
                        <Homepage title="DashBoard">
                            <Dashboard />
                        </Homepage>
                    </Private>
                }
            />
            <Route
                path="/clientesEmAtraso"
                element={
                    <Private>
                        <Homepage title="Clientes em atraso">
                            <ClientesEmAtraso />
                        </Homepage>
                    </Private>
                }
            />
            <Route
                path="/bancoInter"
                element={
                    <Private>
                        <Homepage title="Banco Inter">
                            <BancoInter />
                        </Homepage>
                    </Private>
                }
            />
            <Route
                path="/novoBoleto"
                element={
                    <Private>
                        <Homepage title="Novo Boleto">
                            <NovoBoleto />
                        </Homepage>
                    </Private>
                }
            />
            <Route
                path="/criarInstWpp"
                element={
                    <Private>
                        <Homepage title="Whatsapp">
                            <WhatsAppCriarInstancia />
                        </Homepage>
                    </Private>
                }
            />
            <Route
                path="/listarInstWpp"
                element={
                    <Private>
                        <Homepage title="Whatsapp">
                            <WhatsAppListarInstancia />
                        </Homepage>
                    </Private>
                }
            />
            <Route
                path="/configWpp"
                element={
                    <Private>
                        <Homepage title="Whatsapp">
                            <WhatsAppConfig />
                        </Homepage>
                    </Private>
                }
            />
            <Route
                path="/disparadorWpp"
                element={
                    <Private>
                        <Homepage title="Whatsapp">
                            <WhatsAppDisparador />
                        </Homepage>
                    </Private>
                }
            />
        </Routes>
    );
}
