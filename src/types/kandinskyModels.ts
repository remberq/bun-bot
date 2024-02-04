export type TModelResponse = {
    id: number;
    name: string;
    version: number;
    type: string;
}

export type TRetry<T, R = undefined> = (args: R) => T;

export type TGenerateResponse = {
    status: string;
    uuid: string;
}

export type TCheckGenerationResponse = {
    uuid: string;
    status: 'INITIAL' | 'PROCESSING' | 'DONE' | 'FAIL';
    images: [string];
    errorDescription: string;
    censored: boolean;
}

export type IPropsGenerate = {
    prompt: string;
    modelId?: number;
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
