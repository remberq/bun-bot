import axios from "axios";

export const gigaChat = axios.create({
    baseURL: process.env.GIGA_BASE_URL,
    timeout: 1000,
    headers: {
        'X-Custom-Header': 'foobar',
        "Content-Type": 'application/json'

    },
});