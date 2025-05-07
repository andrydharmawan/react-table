import { useState } from "react"
import { ApiMethod, ApiResponse, UseApiActionProps, UseApiActionReturnType } from "../types";

export const useApiAction = <DReq, DRes>(api: ApiMethod<DReq, DRes>, props?: UseApiActionProps<DReq, DRes>): UseApiActionReturnType<DReq, DRes> => {
    const [loading, setLoading] = useState<boolean>(false)
    const [response, setResponse] = useState<ApiResponse<DRes> | undefined | null>()
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [progress, setProgress] = useState<number>(0);

    const execute = async (values: DReq) => {
        abort()
        
        const controller = new AbortController();
        setAbortController(controller);

        setLoading(true)

        if (props?.beforeRequest) {
            values = props?.beforeRequest(values)
        }

        if (props?.logging) {
            console.log("Before request", values)
        }

        const res = await api(values, undefined, {
            signal: controller.signal,
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                setProgress(percentCompleted);
            },
        })
        if (props?.logging) {
            console.log("After response", res)
        }
        setResponse(res)
        setLoading(false)
        setProgress(0)

        if (res.status && props?.onSuccess) props?.onSuccess(res)
        if (res.status && props?.onError) props?.onError(res)
        props?.afterResponse && props?.afterResponse(res)
    }

    const abort = () => {
        if(abortController){
            abortController.abort()
            setAbortController(null)
        }
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
    ]
}