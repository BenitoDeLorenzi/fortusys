//export const apiInterServ = "https://fortusysapi.com:5000/";
export const apiInterServ = "http://localhost:5000/";

export const sleep = async (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
