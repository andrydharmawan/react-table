import { getApiStore } from "../lib/api-store";
import { ApiMethod, UseCallReturnType } from "../types";

type InferApiRequest<T> = T extends ApiMethod<infer Req, any> ? Req : never;
type InferApiResponse<T> = T extends ApiMethod<any, infer Res> ? Res : never;

export const useApiStore = <T extends ApiMethod<any, any>>(
    api: T,
    key: string
): UseCallReturnType<InferApiRequest<T>, InferApiResponse<T>> => {
    const store = getApiStore(key);
    return store.useStore();
};