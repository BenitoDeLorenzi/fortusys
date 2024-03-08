module.exports = {
    apps: [
        {
            name: "Fortusys",
            script: "npx",
            args: "react-scripts start",
            interpreter: "none",
            env: {
                NODE_ENV: "development",
                PORT: 3000, // certifique-se de que não conflita com a porta da API
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 3000,
            },
        },
    ],
};
