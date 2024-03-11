import { useState, useEffect, useContext } from "react";

import { AuthContexts } from "../../contexts/auth";
import { WhatsAppContexts } from "../../contexts/whatsapp";
import { InterContexts } from "../../contexts/inter";

import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    IconButton,
    CssBaseline,
    Menu,
    MenuItem,
    Avatar,
    Divider,
    ListItemIcon,
} from "@mui/material";

import DrawerHome from "../../components/DrawerHome";

import { Link } from "react-router-dom";

import MenuIcon from "@mui/icons-material/Menu";
import Logout from "@mui/icons-material/Logout";

export default function Homepage({ children, title }) {
    const { user, logOut } = useContext(AuthContexts);
    const { getConfigWpp } = useContext(WhatsAppContexts);
    const { getConfigInter } = useContext(InterContexts);

    const [openDrawer, setOpenDrawer] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const open = Boolean(anchorEl);

    useEffect(() => {
        handleGetConfigWpp();
        handleGetConfigInter();
    }, []);

    async function handleGetConfigWpp() {
        const storagedConfig = localStorage.getItem("@WppConfig");

        if (!storagedConfig) {
            console.log("Buscando config Wpp");
            await getConfigWpp().then((result) => {
                localStorage.setItem("@WppConfig", JSON.stringify(result));
            });
        }
    }

    async function handleGetConfigInter() {
        const storagedConfig = localStorage.getItem("@InterConfig");

        if (!storagedConfig) {
            console.log("Buscando config Inter");
            await getConfigInter().then((result) => {
                localStorage.setItem("@InterConfig", JSON.stringify(result));
            });
        }
    }

    const handleMenu = (e) => {
        setAnchorEl(e.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box
            sx={{
                display: "flex",
                height: "100vh",
                backgroundColor: "#f5f5f5",
            }}
        >
            <CssBaseline />
            <AppBar position="fixed">
                <Toolbar
                    position="fixed"
                    sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
                >
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2, display: { xs: "flex", md: "none" } }}
                        onClick={() => setOpenDrawer(!openDrawer)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ display: { xs: "none", md: "flex" } }}>
                        {" "}
                        <img
                            alt="Logo"
                            src="/images/escrita-white.png"
                            width="200px"
                        />
                    </Box>
                    <Typography
                        fontSize={25}
                        variant="h6"
                        sx={{ ml: { xs: 0, md: 5 } }}
                    >
                        {title}
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            flexGrow: 1,
                            justifyContent: "flex-end",
                        }}
                    >
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <Avatar
                                alt="Avatar"
                                src={user.avatarUrl && user.avatarUrl}
                            />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            id="account-menu"
                            open={open}
                            onClose={handleClose}
                            onClick={handleClose}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    overflow: "visible",
                                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                                    mt: 1.5,
                                    "& .MuiAvatar-root": {
                                        width: 32,
                                        height: 32,
                                        ml: -0.5,
                                        mr: 1,
                                    },
                                    "&::before": {
                                        content: '""',
                                        display: "block",
                                        position: "absolute",
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: "background.paper",
                                        transform:
                                            "translateY(-50%) rotate(45deg)",
                                        zIndex: 0,
                                    },
                                },
                            }}
                            transformOrigin={{
                                horizontal: "right",
                                vertical: "top",
                            }}
                            anchorOrigin={{
                                horizontal: "right",
                                vertical: "bottom",
                            }}
                        >
                            <Link
                                to="/profile"
                                style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                }}
                            >
                                <MenuItem onClick={handleClose}>
                                    <Avatar
                                        alt="Avatar"
                                        src={user.avatarUrl && user.avatarUrl}
                                    />{" "}
                                    Meu perfil
                                </MenuItem>
                            </Link>
                            <Divider />
                            <MenuItem onClick={logOut}>
                                <ListItemIcon>
                                    <Logout fontSize="small" />
                                </ListItemIcon>
                                Sair
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
            <DrawerHome openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} />
            <Box
                component="main"
                sx={{
                    display: "flex",
                    mt: 8,
                    p: 3,
                    width: "100%",
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
