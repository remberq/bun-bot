import axios, {AxiosResponse} from "axios";
import {v4 as uuidv4} from 'uuid';
import {IGigaAuth, IGigaChatRequest, IGigaResponse} from "../types/gigaModels.ts";
import {RequestServices} from "./RequestServices.ts";

export class GigaChatServices extends RequestServices {
    constructor() {
        super();
    }

    public static async getAuth() {
        const RqUID = uuidv4()
        let config = {
            maxBodyLength: Infinity,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                Authorization: 'Basic ' + process.env.GIGA_TOKEN,
                RqUID
            },
        };
        try {
            const response: AxiosResponse<IGigaAuth> = await axios.post(
                process.env.GIGA_AUTH_URL,
                { scope: 'GIGACHAT_API_PERS' },
                config
            )

            return response.data.access_token
        } catch (error) {
            console.log(error, 'ERROR')
        }
    }

    public static async getModels(token: string) {
        try {
            const response = await axios.get(process.env.GIGA_BASE_URL + 'models', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            return response.data
        } catch (error) {
            console.log(error, 'error')
        }
    }

    public static async getRequest(
        {
            token,
            messages,
            model = 'GigaChat:latest',
            temperature = 1.0,
            top_p = 1.0,
            n = 1,
            stream = false,
            max_tokens = 1024,
            repetition_penalty = 1.0,
            update_interval = 1,
        }: IGigaChatRequest & {token: string}
    ) {
        try {
            const request: IGigaChatRequest = {
                model,
                temperature,
                top_p,
                n,
                stream,
                max_tokens,
                repetition_penalty,
                update_interval,
                messages
            }
            const response: AxiosResponse<IGigaResponse> = await axios.post(process.env.GIGA_BASE_URL + 'chat/completions', request, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            return response.data
        } catch (error) {
            console.log(error)
        }
    }

    public static async getGigaChat(requestData: IGigaChatRequest) {
        const token = await this.withRetry(this.getAuth)()

        if (token) {
            return await this.getRequest({token, ...requestData})
        }

        throw Error('Ошибка при получении токена')
    }
}