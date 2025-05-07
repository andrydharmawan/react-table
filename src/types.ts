import moment from "moment";
import { AxiosProgressEvent, AxiosResponse, GenericAbortSignal } from "axios";

export type Children = ChildFunction | React.ReactNode;
type ChildFunction = <T = unknown>(props: T) => Children;

export interface PaginationMeta {
    limit: number;
    page: number;
    totalItems: number;
    totalPages: number;
}

export interface ApiResponse<T = any> {
    status: boolean;
    data: T;
    paging?: PaginationMeta;
    message: string;
    code: number;
}

export type CallbackHelper<T = any> = ((response: ApiResponse<T>) => (void | ApiResponse<T>))

type HandleCallback<T = any> = (props: AxiosResponse<T>, err?: any) => ApiResponse;

export interface UseHelperProps {
    url: string;
    headers?: Record<string, string>;
    token?: string | null | undefined;
    onCallback: HandleCallback;
    onUnauthorized?: (response: ApiResponse) => void;
    handleAuthorization?: (response: ApiResponse, options?: OptionsHelper) => boolean;
    handleToast?: (response: ApiResponse) => void;
    beforeRequest?: (data: any) => any;
}

export interface OptionsHelper {
    infoSuccess: boolean;
    infoError: boolean;
    token: boolean | string;
    headers: Record<string, string>;
    signal: GenericAbortSignal;
    responseType: ResponseType;
    onUploadProgress: (props: AxiosProgressEvent) => void;
    onUnauthorized: (response: ApiResponse) => void;
    disabledHandleUnauthorized: boolean;
}

export type ClientCallback<T> = (response: AxiosResponse<T>, err?: any) => any;

export enum HttpMethod {
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
    GET = "GET"
}

export type ApiMethod<DReq = any, DRes = DReq> = (data: DReq, callback?: CallbackHelper<DRes>, options?: Partial<OptionsHelper>) => Promise<ApiResponse<DRes>>;
export type FetchRequestMethod<DRes = any> = <Res = DRes>(callback?: CallbackHelper<Res>, options?: Partial<OptionsHelper>) => Promise<ApiResponse<Res>>;

export type ApiDefaultMethod<DReq = any, DRes = DReq> = <Req = DReq, Res = DRes>(url: string, data: Req, callback?: CallbackHelper<Res>, options?: Partial<OptionsHelper>) => Promise<ApiResponse<Res>>;
export type ApiDefaultFetch<DRes = any> = <Res = DRes>(url: string, callback?: CallbackHelper<Res>, options?: Partial<OptionsHelper>) => Promise<ApiResponse<Res>>;

export type ResponseType =
    | 'arraybuffer'
    | 'blob'
    | 'document'
    | 'json'
    | 'text'
    | 'stream'
    | 'formdata';

export type OptionsCallReturn<T> = Partial<ApiResponse<T>> & {
    loading: boolean;
    refresh: () => void;
    abort: () => void;
    clear: () => void;
    response: ApiResponse<T> | undefined | null
}

export type UseCallReturnType<T> = [
    T | undefined,
    OptionsCallReturn<T>
]

interface TimeoutConfig {
    value: number;
    unit: moment.DurationInputArg2
}

interface CacheProps {
    key: string;
    timeout: number | TimeoutConfig;
    persistence?: boolean;
}

export interface CacheData<DRes> {
    expired: string;
    data: ApiResponse<DRes>;
}

export interface UseCallOptionsProps<DReq, DRes> {
    logging: boolean;
    beforeRequest: (request: DReq) => DReq;
    afterResponse: (response: DRes) => DRes;
    onBeforeRequest: (request: DReq) => void;
    onAfterResponse: (response: ApiResponse<DRes>) => void;
    trigger: any[];
    hold: boolean;
    onChange: (data: DReq, options: OptionsCallReturn<DRes>) => void;
    cache: CacheProps;
    refreshInterval: number | TimeoutConfig;
}

export interface UseApiActionProps<Req, Res> {
    onSuccess?: OnCallback<Res>;
    onError?: OnCallback<Res>;
    logging?: boolean;
    beforeRequest?: (request: Req) => Req;
    afterResponse?: OnCallback<Res>;
}

type OnCallback<T = any> = (response: ApiResponse<T>) => void

export type UseApiActionReturnType<Req, Res> = [
    (values: Req) => void,
    Partial<ApiResponse<Res>> & {
        abort: () => void;
        reset: () => void;
        loading: boolean;
        progress: number;
    }
]