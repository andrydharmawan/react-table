import { useEffect, useRef, useState } from "react"
import { ApiMethod, ApiResponse, ApiMethodVoid, OptionsHelper, UseApiSendProps, UseApiSendReturnType } from "../types";
import { isNotEmpty } from "../lib/utils";

export function useApiSend<DReq, DRes>(
    api: ApiMethod<DReq, DRes>,
    props?: UseApiSendProps<DReq, DRes>
): UseApiSendReturnType<DReq, DRes>;

export function useApiSend<DRes>(
    api: ApiMethodVoid<DRes>,
    props?: UseApiSendProps<undefined, DRes>
): UseApiSendReturnType<undefined, DRes>;

export function useApiSend<DReq, DRes>(
    api: ApiMethod<DReq, DRes> | ApiMethodVoid<DRes>,
    props?: UseApiSendProps<DReq, DRes>
): UseApiSendReturnType<DReq, DRes> {
    const [loading, setLoading] = useState<boolean>(false)
    const [response, setResponse] = useState<ApiResponse<DRes> | undefined | null>()
    const [progress, setProgress] = useState<number>(0);
    const abortControllerRef = useRef<AbortController>(null);

    useEffect(() => {
        if (!props?.abortOnUnmount) return;

        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    const execute = async (values: DReq) => {
        abortControllerRef.current?.abort();

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true)

        if (props?.beforeRequest) {
            values = props?.beforeRequest(values)
        }

        if (props?.logging) {
            console.log("Before request", values)
        }

        const options: Partial<OptionsHelper> = {
            ...props,
            signal: controller.signal,
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                setProgress(percentCompleted);
            },
        }

        const res = isNotEmpty(values)
            ? await (api as ApiMethod<DReq, DRes>)(values, undefined, options)
            : await (api as ApiMethodVoid<DRes>)(undefined, options);

        if (props?.logging) {
            console.log("After response", res)
        }
        setResponse(res)
        setLoading(false)
        setProgress(0)

        if (res.status && props?.onSuccess) props?.onSuccess(res)
        if (!res.status && props?.onError) props?.onError(res)
        props?.afterResponse && props?.afterResponse(res)
    }

    const abort = () => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        setLoading(false)
        setProgress(0)
    };

    const reset = () => {
        setLoading(false)
        setProgress(0)
        setResponse(null)
    }

    return [
        execute,
        {
            ...response,
            loading,
            abort,
            progress,
            reset,
        },
    ] as unknown as UseApiSendReturnType<DReq, DRes>
}