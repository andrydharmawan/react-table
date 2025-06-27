import { getApiStore } from "../lib/api-store";
import { ApiMethod, UseCallReturnType } from "../types";

export const useApiStore = <DReq, DRes>(api: ApiMethod<DReq, DRes>, key: string): UseCallReturnType<DReq, DRes> => {
    const store = getApiStore(key);
    return store.useStore();
}