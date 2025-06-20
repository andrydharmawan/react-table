import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";
import { UseHelperProps, ApiResponse, OptionsHelper, CallbackHelper, ClientCallback, HttpMethod, ApiDefaultMethod, ApiDefaultFetch as ApiDefaultFetch } from "../types";
import { useCrypto } from "./use-crypto.hook";

export const createApiHelper = <DReq = any, DRes = any>({
    url,
    token,
    beforeRequest,
    onCallback,
    headers: headerProps,
    onUnauthorized,
    handleToast,
    handleAuthorization = () => true,
    disabledToastWhenCancel: disabledToastWhenCancelProps,
    withCredentials,
    encryptRequest: encryptRequestDefault,
    encryptResponse: encryptResponseDefault,
    passphrase,
}: UseHelperProps) => {
    const { encrypt, decrypt, passphrase: passphraseCore } = useCrypto()

    const handleResponse = (response: AxiosResponse, callback?: CallbackHelper, options?: OptionsHelper, err?: any): any => {
        const isCancel = err?.code === "ERR_CANCELED";
        let data = response?.data;

        const encryptRes = typeof options?.encryptResponse === "boolean" ? options?.encryptResponse : encryptResponseDefault;

        if (encryptRes && data) {
            const keys = options?.passphrase
                ? (typeof options.passphrase === "boolean" && options.passphrase
                    ? passphraseCore
                    : options.passphrase)
                : passphrase;

            data = decrypt(data, keys);
        }

        const result: ApiResponse = onCallback({ ...{ ...response, data }, isCancel }, err)

        const disabledToastCancel = typeof options?.disabledToastWhenCancel === "boolean" ? options?.disabledToastWhenCancel : disabledToastWhenCancelProps;

        const authorized = handleAuthorization(result, options)

        if ((options?.infoSuccess && result.status) || (options?.infoError && !result.status)) {
            if (handleToast && (!isCancel || !disabledToastCancel)) {
                handleToast(result);
            }
        }

        if (!authorized && (!isCancel || !options?.disabledHandleUnauthorized)) {
            const handler = options?.onUnauthorized || onUnauthorized;
            if (handler) handler(result);
        }

        if (callback) callback(result)
        else return result;
    }

    const client = (props: AxiosRequestConfig, callback: ClientCallback<DRes> = () => { }) => {
        const clientAxios = axios.create({
            baseURL: `${url}`,
            withCredentials: typeof props.withCredentials === "boolean" ? props.withCredentials : withCredentials,
        });

        return clientAxios(props)
            .then(callback)
            .catch(err => callback(err.response, err));
    };

    const request = (method: Method, url: string, data: any, callback?: CallbackHelper, options?: Partial<OptionsHelper>): Promise<ApiResponse> => {
        const defaultOptions: Partial<OptionsHelper> = {
            token: true,
            infoError: true,
            infoSuccess: true,
            responseType: "json",
        }

        const opts = {
            ...defaultOptions,
            ...options,
        } as OptionsHelper

        let headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...headerProps,
            ...opts.headers,
        }

        if (opts.token) {
            if (typeof opts.token === "boolean") {
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }
            }
            else {
                if (opts.token) headers.Authorization = `Bearer ${opts.token}`
            };
        }

        if (beforeRequest) {
            data = beforeRequest(data);
        }
        const encryptReq = typeof opts?.encryptRequest === "boolean" ? opts?.encryptRequest : encryptRequestDefault;

        if (encryptReq && data) {
            const keys = options?.passphrase
                ? (typeof options.passphrase === "boolean" && options.passphrase
                    ? passphraseCore
                    : options.passphrase)
                : passphrase;

            data = encrypt(data, keys)
        }

        return client({
            url,
            method,
            data,
            headers,
            responseType: opts.responseType,
            signal: opts.signal,
            withCredentials: opts.withCredentials,
            onUploadProgress: e => {
                if (opts?.onUploadProgress) opts?.onUploadProgress(e)
            },
        }, (res, err) => handleResponse(res, callback, opts, err)) as Promise<ApiResponse>;
    }

    const post: ApiDefaultMethod<DReq, DRes> = (url, data, callback, config) => {
        return request(HttpMethod.POST, `${url}`, data, callback, config)
    }

    const put: ApiDefaultMethod<DReq, DRes> = (url, data, callback, config) => {
        return request(HttpMethod.PUT, `${url}`, data, callback, config)
    }

    const patch: ApiDefaultMethod<DReq, DRes> = (url, data, callback, config) => {
        return request(HttpMethod.PATCH, `${url}`, data, callback, config)
    }

    const deleteBase: ApiDefaultFetch<DRes> = (url, callback, config) => {
        return request(HttpMethod.DELETE, `${url}`, null, callback, config)
    }

    const get: ApiDefaultFetch<DRes> = (url, callback, config) => {
        return request(HttpMethod.GET, `${url}`, null, callback, config)
    }

    const upload: ApiDefaultMethod<DReq, DRes> = (url, data: any, callback, config) => {
        let formData = new FormData();
        Object.keys(data).forEach(item => formData.append(item, data[item]))
        return request(HttpMethod.POST, `${url}`, formData, callback, {
            infoSuccess: false,
            ...config,
            headers: {
                "Content-Type": "multipart/form-data",
                ...config?.headers
            }
        })
    }

    return {
        client,
        post,
        put,
        patch,
        delete: deleteBase,
        get,
        upload,
    }
}