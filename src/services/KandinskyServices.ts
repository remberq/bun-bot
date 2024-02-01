import axios, {AxiosResponse} from "axios";
import FormData from "form-data";
import fs from "fs";

type TModelResponse = {
    id: number;
    name: string;
    version: number;
    type: string;
}

type TGenerateResponse = {
    status: string;
    uuid: string;
}

type TCheckGenerationResponse = {
    uuid: string;
    status: 'INITIAL' | 'PROCESSING' | 'DONE' | 'FAIL';
    images: [string];
    errorDescription: string;
    censored: boolean;
}

export type IPropsGenerate = {
    prompt: string;
    imageCount?: number;
    width?: number;
    height?: number;
    style?: string;
}

export type TStylesResponse = {
    name: string;
    title: string;
    titleEn?: string;
    image?: string;
}

export class KandinskyServices {
    static X_KEY = `Key ${process.env.KANDINSKY_TOKEN}`;
    static X_SECRET = `Secret ${process.env.KANDINSKY_SECRET}`;
    static HEADERS = {
        'X-Key': this.X_KEY,
        'X-Secret': this.X_SECRET
    };
    static MODEL_ID: number;
    static UUID: string;
    static PICTURE: string;

    public static async getAuth() {
        try {
            const response: AxiosResponse<TModelResponse[]> = await axios
                .get(process.env.KANDINSKY_BASE_URL + 'models', {
                    headers: this.HEADERS
                })
            this.MODEL_ID = response.data[0].id
        } catch (error) {
            console.log(error, 'Error response')
        }
    }

    public static async generate({
     prompt,
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
        const modelIdData = { value: this.MODEL_ID, options: {contentType: undefined}}
        const paramsData = { value: JSON.stringify(params), options: {contentType: 'application/json'} }
        formData.append('model_id', modelIdData.value, modelIdData.options)
        formData.append('params', paramsData.value, paramsData.options)

        try {
            const response: AxiosResponse<TGenerateResponse> = await axios.post(
                process.env.KANDINSKY_BASE_URL + 'text2image/run',
                formData, {
                    headers: {
                        ...formData.getHeaders(),
                        ...this.HEADERS
                    },
                    // @ts-ignore
                    'Content-Type': 'multipart/form-data'
                })
            const data = response.data
            this.UUID = data.uuid
        } catch (err) {
            console.log('This Error', err)
        }
    }

    public static async checkGeneration(
        requestId: string,
        attempts = 10,
        delay = 10
    ) {
        while (attempts > 0) {
            try {
                const response: AxiosResponse<TCheckGenerationResponse> = await axios.get(
                    process.env.KANDINSKY_BASE_URL + `text2image/status/${requestId}`,
                    {
                        headers: this.HEADERS
                    }
                )

                const data = response.data
                if (data.status === 'DONE') {
                    this.PICTURE = data.images[0]
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
        await this.getAuth()
        await this.generate(generateData)
        await this.checkGeneration(this.UUID)
        const pic = this.PICTURE.replace(/^data:image\/w+;base64,/, '')

        return Buffer.from(pic, 'base64')
    }

    public static async getStyles() {
        const response: AxiosResponse<TStylesResponse[]> = await axios.get('https://cdn.fusionbrain.ai/static/styles/api')

        return response.data
    }
}