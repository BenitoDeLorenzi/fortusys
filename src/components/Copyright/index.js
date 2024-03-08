import { Typography, Link } from "@mui/material";

export default function Copyright(props) {
    return (
        <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            mt={4}
            {...props}
        >
            {"Copyright © "}
            <Link color="inherit" href="/">
                Fortusys
            </Link>{" "}
            {new Date().getFullYear()}
            {"."}
        </Typography>
    );
}
