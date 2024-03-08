import { useState, useEffect, createContext } from "react";
import { auth, db } from "../services/firebaseConnection";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const AuthContexts = createContext({});

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function loadUser() {
            const storageUser = localStorage.getItem("@Fortusys");

            if (storageUser) {
                setUser(JSON.parse(storageUser));
                setLoading(false);
            }

            setLoading(false);
            setLoadingAuth(false);
        }
        loadUser();
    }, []);

    const signIn = async (email, password, rememberMe) => {
        setLoadingAuth(true);

        await signInWithEmailAndPassword(auth, email, password)
            .then(async (value) => {
                let uid = value.user.uid;

                const docRef = doc(db, "users", uid);
                const docSnap = await getDoc(docRef);

                let data = {
                    uid: uid,
                    nome: docSnap.data().nome,
                    email: value.user.email,
                    avatarUrl: docSnap.data().avatarUrl,
                    active: docSnap.data().active,
                    rememberMe: rememberMe,
                };

                if (data.active) {
                    setUser(data);
                    storageUser(data);
                    rememberMe &&
                        localStorage.setItem("rememberMe", rememberMe);
                    toast.success("Seja bem-vindo");
                    navigate("/dashboard");
                } else {
                    toast.info("Aguardando ativação do usuario");
                }
            })
            .catch((error) => {
                toast.error("Credenciais invalidas.");
                console.log(error.message);
            });
        setLoadingAuth(false);
    };

    async function signUp(email, password, nome) {
        setLoadingAuth(true);

        await createUserWithEmailAndPassword(auth, email, password)
            .then(async (value) => {
                let uid = value.user.uid;

                await setDoc(doc(db, "users", uid), {
                    nome: nome,
                    avatarUrl: null,
                    email: email,
                    active: false,
                }).then(() => {
                    let data = {
                        uid: uid,
                        nome: nome,
                        email: value.user.email,
                        avatarUrl: null,
                        active: false,
                    };

                    storageUser(data);
                    toast.info("Aguarde para ser ativado.");
                    navigate("/");
                });
            })
            .catch((error) => {
                console.log(error.message);
                if (
                    error.message ===
                    "Firebase: Error (auth/email-already-in-use)."
                ) {
                    toast.error("Este e-mail jè esta em uso!");
                } else {
                    toast.error(error.message);
                }

                setLoadingAuth(false);
            });
        setLoadingAuth(false);
    }

    function storageUser(data) {
        localStorage.setItem("@Fortusys", JSON.stringify(data));
    }

    async function logOut() {
        await signOut(auth);
        localStorage.removeItem("@Fortusys");
        localStorage.removeItem("rememberMe");
        setUser(null);
        setLoadingAuth(false);
    }

    async function forgotPassword(email) {
        if (!email) {
            toast.error("Preencha seu email");
        } else {
            await sendPasswordResetEmail(auth, email)
                .then((data) => {
                    toast.info("Verifique seu email");
                    console.log(data);
                })
                .catch((error) => {
                    console.log(error);
                    console.log(error.message);
                });
        }
    }

    return (
        <AuthContexts.Provider
            value={{
                signed: !!user,
                user,
                signIn,
                signUp,
                logOut,
                loadingAuth,
                loading,
                storageUser,
                setUser,
                forgotPassword,
            }}
        >
            {children}
        </AuthContexts.Provider>
    );
}

export default AuthProvider;
