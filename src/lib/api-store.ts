import { createStore } from "./create-store";

type ApiTuple = [any, any];

const apiStoreMap = new Map<string, ReturnType<typeof createStore<ApiTuple>>>();

export function getApiStore(key: string) {
    if (!apiStoreMap.has(key)) {
        apiStoreMap.set(key, createStore<ApiTuple>([null, {}]));
    }
    return apiStoreMap.get(key)!;
}