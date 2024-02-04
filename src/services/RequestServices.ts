import {TRetry} from "../types/kandinskyModels.ts";

export class RequestServices {
    static withRetry<T, M = undefined>(callback: TRetry<T, M>) {
        let retryCount = 2

        return async (...args: M[]) => {
            while (retryCount) {
                try {
                    // @ts-ignore
                    return await callback(...args)
                } catch (e) {
                    retryCount--
                }
            }
        }
    }
}