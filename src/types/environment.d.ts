export interface IProcessEnv {
    TOKEN: string;
    GIGA_BASE_URL: string;
    KANDINSKY_BASE_URL: string;
    KANDINSKY_TOKEN: string;
    GIGA_TOKEN: string;
    KANDINSKY_SECRET: string;
    GIGA_AUTH_URL: string;
    NODE_TLS_REJECT_UNAUTHORIZED: number;
    BOT_MODE: 'EVENT' | 'DEFAULT'
}

declare global {
    namespace NodeJS {
        interface ProcessEnv extends IProcessEnv { }
    }
}