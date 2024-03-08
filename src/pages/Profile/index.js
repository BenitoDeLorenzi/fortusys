import { useState, useContext, useRef } from "react";

import { AuthContexts } from "../../contexts/auth";

import {
    Avatar,
    Grid,
    Card,
    CardContent,
    Button,
    Badge,
    CircularProgress,
    TextField,
} from "@mui/material";

import CameraAltIcon from "@mui/icons-material/CameraAlt";

import { toast } from "react-toastify";

import { db, storage } from "../../services/firebaseConnection";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const PerfilPage = () => {
    const { user, setUser, storageUser, loadingAuth } =
        useContext(AuthContexts);
    const [nome, setNome] = useState(user.nome);
    const [avatar, setAvatar] = useState(user.avatarUrl);
    const [imageAvatar, setImageAvatar] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef();

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (file && file.type.startsWith("image/") && file.size <= 5000000) {
            try {
                const fileUrl = URL.createObjectURL(file);
                setImageAvatar(file);
                setAvatar(fileUrl);
            } catch (error) {
                console.log(error);
                setImageAvatar(null);
            }
        } else {
            toast.error("Envie uma arquivo do tipo imagem e até 5MB");
            return;
        }
    };

    async function handleUpload() {
        setLoading(true);
        const currentUid = user.uid;

        const uploadRef = ref(
            storage,
            `images/${currentUid}/${imageAvatar.name}`
        );

        const uploadTask = uploadBytes(uploadRef, imageAvatar)
            .then((snapshot) => {
                getDownloadURL(snapshot.ref).then(async (downloadUrl) => {
                    let urlFoto = downloadUrl;

                    const docRef = doc(db, "users", user.uid);
                    await updateDoc(docRef, {
                        avatarUrl: urlFoto,
                        nome: nome,
                    }).then(() => {
                        let data = {
                            ...user,
                            nome: nome,
                            avatarUrl: urlFoto,
                        };

                        setUser(data);
                        storageUser(data);
                        toast.success("Usuario atualizado com sucesso!");
                        setLoading(false);
                    });
                });
            })
            .catch((error) => {
                console.log(error);
                toast.error(error.message);
                setLoading(false);
            });
    }

    async function handleUpdate() {
        if (imageAvatar === null && nome !== "") {
            const docRef = doc(db, "users", user.uid);
            await updateDoc(docRef, {
                nome: nome,
            }).then(() => {
                let data = {
                    ...user,
                    nome: nome,
                };

                setUser(data);
                storageUser(data);

                toast.success("Usuario atualizado com sucesso!");
            });
        } else if (imageAvatar !== null && nome !== "") {
            await handleUpload();
        }
    }

    return (
        <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} md={6}>
                <Card>
                    <CardContent>
                        <Grid
                            container
                            spacing={2}
                            alignItems="center"
                            direction="column"
                        >
                            <Grid item>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: "none" }}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                                <Badge
                                    overlap="circular"
                                    anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "right",
                                    }}
                                    badgeContent={
                                        <CameraAltIcon
                                            sx={{
                                                backgroundColor: "white",
                                                borderRadius: "50%",
                                                cursor: "pointer",
                                                "&:hover": {
                                                    backgroundColor:
                                                        "rgba(255, 255, 255, 0.8)",
                                                },
                                            }}
                                            onClick={handleAvatarClick}
                                        />
                                    }
                                >
                                    <Avatar
                                        alt={user.nome}
                                        src={avatar}
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            cursor: "pointer",
                                        }}
                                        onClick={handleAvatarClick}
                                        onMouseOver={(e) =>
                                            (e.target.style.opacity = 0.8)
                                        }
                                        onMouseOut={(e) =>
                                            (e.target.style.opacity = 1)
                                        }
                                    />
                                </Badge>
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Nome"
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    className="profile-input"
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Email"
                                    value={user.email}
                                    disabled
                                    className="profile-input"
                                />
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleUpdate}
                                    sx={{ width: "180px" }}
                                >
                                    {loading ? (
                                        <CircularProgress
                                            size={25}
                                            color="inherit"
                                        />
                                    ) : (
                                        "Atualizar perfil"
                                    )}
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default PerfilPage;
