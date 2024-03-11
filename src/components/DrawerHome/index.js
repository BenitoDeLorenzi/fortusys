import { useState, Fragment } from "react";
import { useTheme } from "@mui/material/styles";
import {
    Drawer,
    Toolbar,
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import SettingsIcon from "@mui/icons-material/Settings";
import SendToMobileIcon from "@mui/icons-material/SendToMobile";

import { Link, useLocation } from "react-router-dom";

const drawerWidth = 240;

const menuItems = [
    { name: "Dashboard", icon: <DashboardIcon />, link: "/dashboard" },
    {
        name: "Cobrança",
        icon: <AccountBalanceIcon />,
        subItems: [
            {
                name: "Clientes em atraso",
                icon: <HourglassEmptyIcon />,
                link: "/clientesEmAtraso",
            },
            {
                name: (
                    <img
                        alt="Logo inter"
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Logo-banco-inter.svg/512px-Logo-banco-inter.svg.png"
                        width={50}
                        style={{ margin: 0, padding: 0 }}
                    />
                ),
                icon: <AccountBalanceIcon />,
                link: "/bancoInter",
            },
            {
                name: "Configurações",
                icon: <SettingsIcon />,
                link: "/configInter",
            },
        ],
    },
    {
        name: "Whatsapp",
        icon: <WhatsAppIcon />,
        subItems: [
            {
                name: "Criar instancia",
                icon: <NoteAddIcon />,
                link: "/criarInstWpp",
            },
            {
                name: "Listar instancias",
                icon: <FormatListBulletedIcon />,
                link: "/listarInstWpp",
            },
            {
                name: "Disparador",
                icon: <SendToMobileIcon />,
                link: "/disparadorWpp",
            },
            {
                name: "Configurações",
                icon: <SettingsIcon />,
                link: "/configWpp",
            },
        ],
    },
];

export default function DrawerHome({ openDrawer, setOpenDrawer }) {
    const theme = useTheme();
    const location = useLocation();
    const [open, setOpen] = useState({});

    const handleClick = (item) => {
        setOpen((prevOpen) => ({ ...prevOpen, [item]: !prevOpen[item] }));
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: "border-box",
                    zIndex: (theme) => theme.zIndex.appBar - 1,
                    transition: theme.transitions.create("width", {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                },
                display: { xs: openDrawer ? "flex" : "none", md: "flex" },
            }}
        >
            <Toolbar />
            <Box sx={{ overflow: "auto" }}>
                <List
                    sx={{
                        width: "100%",
                        maxWidth: 360,
                    }}
                    component="nav"
                    aria-labelledby="nested-list-subheader"
                >
                    {menuItems.map((item, index) => (
                        <Fragment key={index}>
                            <ListItemButton
                                sx={{
                                    width: "100%",
                                    backgroundColor:
                                        location.pathname === item.link
                                            ? "rgba(0, 0, 0, 0.1)"
                                            : "none",
                                }}
                                component={item.link ? Link : "button"}
                                to={item.link}
                                onClick={() => {
                                    item.link && setOpenDrawer(!openDrawer);
                                    item.subItems && handleClick(item.name);
                                }}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.name} />
                                {item.subItems &&
                                    (open[item.name] ? (
                                        <ExpandLess />
                                    ) : (
                                        <ExpandMore />
                                    ))}
                            </ListItemButton>
                            {item.subItems && (
                                <Collapse
                                    in={open[item.name]}
                                    timeout="auto"
                                    unmountOnExit
                                >
                                    <List component="div" disablePadding>
                                        {item.subItems.map(
                                            (subItem, subIndex) => (
                                                <ListItemButton
                                                    onClick={() => {
                                                        setOpenDrawer(
                                                            !openDrawer
                                                        );
                                                    }}
                                                    key={subIndex}
                                                    sx={{
                                                        pl: 4,
                                                        backgroundColor:
                                                            location.pathname ===
                                                            subItem.link
                                                                ? "rgba(0, 0, 0, 0.1)"
                                                                : "none",
                                                        display: "flex",
                                                    }}
                                                    component={
                                                        subItem.link
                                                            ? Link
                                                            : "button"
                                                    }
                                                    to={subItem.link}
                                                >
                                                    <ListItemIcon>
                                                        {subItem.icon}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        sx={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            m: 0,
                                                        }}
                                                        primary={subItem.name}
                                                    />
                                                </ListItemButton>
                                            )
                                        )}
                                    </List>
                                </Collapse>
                            )}
                        </Fragment>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
}
