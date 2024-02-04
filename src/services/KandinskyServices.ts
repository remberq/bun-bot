import axios, {AxiosResponse} from "axios";
import FormData from "form-data";
import {
    IPropsGenerate,
    TCheckGenerationResponse,
    TGenerateResponse,
    TModelResponse,
    TStylesResponse
} from "../types/kandinskyModels.ts";
import {RequestServices} from "./RequestServices.ts";

const HEADERS = {
    'X-Key': `Key ${process.env.KANDINSKY_TOKEN}`,
    'X-Secret': `Secret ${process.env.KANDINSKY_SECRET}`
}
export class KandinskyServices extends RequestServices{

    constructor() {
        super();
    }
    static async getAuth() {
        try {
            const response: AxiosResponse<TModelResponse[]> = await axios
                .get(process.env.KANDINSKY_BASE_URL + 'models', {
                    headers: HEADERS
                })
            return response.data[0].id
        } catch (error) {
            console.log(error, 'Error response')
        }
    }

    static async generate({
        prompt,
        modelId,
        imageCount = 1,
        width = 1024,
        height = 1023,
        style = 'DEFAULT'
     }: IPropsGenerate) {
        const params = {
            type: 'GENERATE',
            numImages: imageCount,
            width,
            height,
            style: style,
            generateParams: {
                query: prompt
            }
        }

        const formData = new FormData()
        const modelIdData = { value: modelId, options: {contentType: undefined}}
        const paramsData = { value: JSON.stringify(params), options: {contentType: 'application/json'} }
        formData.append('model_id', modelIdData.value, modelIdData.options)
        formData.append('params', paramsData.value, paramsData.options)

        try {
            const response: AxiosResponse<TGenerateResponse> = await axios.post(
                process.env.KANDINSKY_BASE_URL + 'text2image/run',
                formData, {
                    headers: {
                        ...formData.getHeaders(),
                        ...HEADERS
                    },
                    // @ts-ignore
                    'Content-Type': 'multipart/form-data'
                })
            const data = response.data
            return data.uuid
        } catch (err) {
            console.log('This Error', err)
        }
    }

    static async checkGeneration(
        requestId: string,
        attempts = 10,
        delay = 15
    ) {
        while (attempts > 0) {
            try {
                const response: AxiosResponse<TCheckGenerationResponse> = await axios.get(
                    process.env.KANDINSKY_BASE_URL + `text2image/status/${requestId}`,
                    {
                        headers: HEADERS,
                    },
                )

                const data = response.data
                if (data.status === 'DONE') {
                    console.log('Картинка готова!')
                    return data.images;
                }
            } catch (error) {
                console.log(error)
            }
            attempts -= 1
            console.log('Еще не готово')
            await new Promise((resolve) => setTimeout(resolve, delay * 1000))
        }
    }

    public static async getKandinsky(generateData: IPropsGenerate) {
        const modelId = await this.withRetry(this.getAuth)()
        const requestUuid = await this.withRetry(this.generate)({...generateData, modelId})
        if (requestUuid) {
            const pictures = await this.withRetry(this.checkGeneration)(requestUuid)
            return pictures?.map((picture) => {
                const pic = picture.replace(/^data:image\/w+;base64,/, '')
                return Buffer.from(pic, 'base64')
            }) ?? []
        } else {
            throw Error('Не найден REQUEST_ID!')
        }
    }

    public static async getStyles() {
        const response: AxiosResponse<TStylesResponse[]> = await axios.get('https://cdn.fusionbrain.ai/static/styles/api')

        return response.data
    }
}