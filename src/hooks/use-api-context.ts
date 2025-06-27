import { getApiStore } from "../lib/api-store";
import { UseCallReturnType } from "../types";

export function useApiContext<DReq = any, DRes = DReq>(key: string): UseCallReturnType<DReq, DRes> {
    const store = getApiStore(key);
    return store.useStore();
}