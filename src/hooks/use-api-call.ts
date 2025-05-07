import moment from "moment";
import { useEffect, useRef, useState } from "react"
import { isNotEmpty } from "../lib/utils";
import { ApiMethod, CacheData, ApiResponse, UseCallReturnType, UseCalOptionsProps } from "../types";

export const useApiCall = <DReq, DRes>(api: ApiMethod<DReq, DRes>, data: DReq, options?: Partial<UseCalOptionsProps<DReq, DRes>>): UseCallReturnType<DRes> => {
    const [loading, setLoading] = useState<boolean>(false)
    const [response, setResponse] = useState<ApiResponse<DRes> | undefined | null>()
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const prevDataRef = useRef<DReq | undefined>(undefined);

    useEffect(() => {
        const prevDataString = JSON.stringify(prevDataRef.current);
        const currentDataString = JSON.stringify(data);

        if (prevDataString !== currentDataString && isNotEmpty(data) && !options?.hold) {
            setResponse(null)
            refresh();
            prevDataRef.current = data;
        }

        if (options?.logging && options?.hold) {
            console.log("Hold active");
        }

        options?.onChange && options?.onChange(data, resultOptions)
    }, [data, options?.hold, ...(options?.trigger || [])])

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (!options?.cache?.persistence && options?.cache?.key) {
                caches.delete(options?.cache?.key);
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    const refresh = async () => {
        if (options?.beforeRequest) {
            data = options?.beforeRequest(data)
        }

        const key = JSON.stringify(data || "null");

        if (options?.cache) {

            setLoading(true)

            if (options?.onBeforeRequest) {
                options?.onBeforeRequest(data)
            }

            const cache = await caches.open(options.cache.key);
            const cachedResponse = await cache.match(key);
            const response: CacheData<DRes> = await cachedResponse?.json();
            if (response) {
                const { data, expired } = response;

                const isExpired = moment().isAfter(expired);

                if (!isExpired) {
                    if (options?.afterResponse && data?.data) data.data = options?.afterResponse(data.data)

                    if (options?.logging) {
                        console.log("After request: Using Cache", data)
                    }

                    if (options?.onAfterResponse) {
                        options?.onAfterResponse(data)
                    }

                    setLoading(false)

                    setResponse(data)
                    return
                }
                else {
                    await cache.delete(key);
                }
            }
        }


        if (typeof api === "function") {
            const controller = new AbortController();
            setAbortController(controller);
            setLoading(true)

            if (options?.logging) {
                console.log("Before request", data)
            }

            if (options?.onBeforeRequest) {
                options?.onBeforeRequest(data)
            }

            const res = await api(data, undefined, { signal: controller.signal })

            if (options?.afterResponse && res?.data) res.data = options?.afterResponse(res.data)

            if (options?.logging) {
                console.log("After request", res)
            }

            if (options?.onAfterResponse) {
                options?.onAfterResponse(res)
            }

            setLoading(false)

            setResponse(res)

            if (options?.cache) {
                const timeout = typeof options.cache.timeout === "number" ? options.cache.timeout : options.cache.timeout.value;
                const timeoutUnit = typeof options.cache.timeout === "number" ? "s" : options.cache.timeout.unit;
                const expired = moment().add(timeout, timeoutUnit).toISOString();

                const cacheData: CacheData<DRes> = {
                    data: res,
                    expired
                }

                const cache = await caches.open(options.cache.key);
                const response = new Response(JSON.stringify(cacheData));
                await cache.put(key, response);
            }

        }
    }

    useEffect(() => {
        if (options?.refreshInterval) {
            const timeoutValue = typeof options.refreshInterval === "number" ? options.refreshInterval : options.refreshInterval.value;
            const timeoutUnit = typeof options.refreshInterval === "number" ? "s" : options.refreshInterval.unit;

            const intervalId = setInterval(() => {
                refresh();
            }, moment.duration(timeoutValue, timeoutUnit).asMilliseconds());

            return () => clearInterval(intervalId);
        }

        return () => { }
    }, [options?.refreshInterval, refresh]);

    const abort = () => {
        abortController?.abort()
        setLoading(false)
        setAbortController(null)
    };

    const clear = () => {
        setLoading(false)
        setResponse(null)
    }

    const resultOptions = {
        ...response,
        loading,
        refresh,
        abort,
        clear,
        response,
    }

    return [
        response?.data,
        resultOptions,
    ]
}