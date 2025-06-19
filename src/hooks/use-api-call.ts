import moment from "moment";
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { generateCacheKey, isNotEmpty } from "../lib/utils";
import { ApiMethod, CacheData, ApiResponse, UseCallReturnType, UseCallOptionsProps, OptionsCallReturn } from "../types";
import { useBgsCore } from "../contexts/BgsCore.context";
import { useStorage } from "./use-storage.hook";

export const useApiCall = <DReq, DRes>(api: ApiMethod<DReq, DRes>, data?: DReq, options?: Partial<UseCallOptionsProps<DReq, DRes>>): UseCallReturnType<DReq, DRes> => {
    const { storageKey } = useBgsCore();
    const storage = useStorage()
    const session = storageKey ? storage.get<string>(storageKey) : undefined;

    // State untuk menandakan proses loading (request API)
    const [loading, setLoading] = useState<boolean>(false)

    // State untuk menyimpan response dari API
    const [response, setResponse] = useState<ApiResponse<DRes> | undefined | null>()

    // Ref untuk menyimpan data request sebelumnya agar bisa dibandingkan perubahan data
    const prevDataRef = useRef<DReq | undefined>(undefined);

    // Ref untuk menyimpan abort controller agar request bisa dibatalkan saat perlu
    const abortControllerRef = useRef<AbortController>(null);

    const { cacheName, cacheKey, timeout, timeoutUnit, persistence } = useMemo(() => {
        const cacheName: string = typeof options?.cache === "object" ? (options?.cache?.cacheName ?? api.name) : api.name;
        const cacheKey: string = generateCacheKey({ ...data, session }, typeof options?.cache === "object" ? options?.cache?.cacheKey : undefined);
        const persistence: boolean = typeof options?.cache === "object" ? (options?.cache?.persistence ?? false) : false;
        let timeout: number = 60 * 5
        let timeoutUnit: moment.DurationInputArg2 = "s";

        if (options?.cache) {
            if (typeof options.cache !== "boolean") {
                if (typeof options.cache.timeout === "number") {
                    timeout = options.cache.timeout;
                    timeoutUnit = "s";
                }
                else if (typeof options.cache.timeout === "object") {
                    timeout = options.cache.timeout.value;
                    timeoutUnit = options.cache.timeout.unit;
                }
            }
        }

        return {
            cacheName,
            cacheKey,
            timeout,
            timeoutUnit,
            persistence
        }
    }, [options?.cache])

    // Effect untuk memantau perubahan `data` atau `options.trigger` dan otomatis panggil refresh jika data berubah
    useEffect(() => {
        const prevDataString = JSON.stringify(isNotEmpty(prevDataRef.current) ? prevDataRef.current : "");
        const currentDataString = JSON.stringify(isNotEmpty(data) ? data : "");
        const isInitial = prevDataRef.current === undefined;

        // Jika data berubah atau pertama kali load, dan tidak dalam mode hold, maka panggil refresh
        if ((prevDataString !== currentDataString || isInitial) && !options?.hold) {
            setResponse(null) // reset response dulu sebelum fetch baru
            refresh(); // fungsi refresh untuk request API / cache
            prevDataRef.current = data; // update prev data
        }

        // Callback onChange jika ada, dipanggil setiap kali data berubah
        options?.onChange && options?.onChange(data!, resultOptions)
    }, [data, options?.hold, ...(options?.trigger || [])])

    // Effect untuk menangani event sebelum window unload (misal reload/close)
    useEffect(() => {
        const handleBeforeUnload = async () => {
            // Jika cache tidak dipersisten, hapus cache dengan nama cacheName
            if (!persistence && cacheName && cacheKey) {
                const cache = await caches.open(cacheName);
                cache.delete(cacheKey)
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            // Cleanup event listener dan abort request jika ada saat unmount
            window.removeEventListener("beforeunload", handleBeforeUnload);
            abortControllerRef.current?.abort();
        };
    }, []);

    // Fungsi utama refresh, yang melakukan request API dengan cache handling dan abort controller
    const refresh = useCallback(async () => {
        if (options?.hold) {
            options?.logging && console.log("Hold active");
        }

        // Jika ada hook beforeRequest, panggil untuk modifikasi data sebelum request
        if (options?.beforeRequest) {
            data = options?.beforeRequest(data!)
        }

        // Jika opsi cache aktif, coba baca dulu dari cache
        if (options?.cache) {

            setLoading(true)

            if (options?.onBeforeRequest) {
                options?.onBeforeRequest(data!)
            }

            const cache = await caches.open(cacheName);
            const cachedResponse = await cache.match(cacheKey);
            const response: CacheData<DRes> = await cachedResponse?.json();
            if (response) {
                const { data, expired } = response;

                // Cek apakah cache sudah expired berdasarkan waktu sekarang
                const isExpired = moment().isAfter(expired);

                if (!isExpired) {
                    // Jika ada hook afterResponse, modifikasi data dari cache
                    if (options?.afterResponse && data?.data) data.data = options?.afterResponse(data.data)

                    if (options?.logging) {
                        console.log("After request: Using Cache", data)
                    }

                    if (options?.onAfterResponse) {
                        options?.onAfterResponse(data)
                    }

                    setLoading(false)

                    // Set response dari cache dan hentikan fungsi refresh disini
                    setResponse(data)
                    return
                }
                else {
                    // Jika cache expired, hapus cache entry tersebut
                    await cache.delete(cacheKey);
                }
            }
        }

        // Jika tidak ada cache atau cache expired, lakukan request API
        if (typeof api === "function") {
            // Batalkan request sebelumnya jika ada
            abortControllerRef.current?.abort();

            const controller = new AbortController();
            abortControllerRef.current = controller;
            setLoading(true)

            if (options?.logging) {
                console.log("Before request", data)
            }

            if (options?.onBeforeRequest) {
                options?.onBeforeRequest(data!)
            }

            // Panggil API dengan abort signal untuk bisa dibatalkan jika perlu
            const res = await api(data!, undefined, { ...options, signal: controller.signal })

            // Jika ada hook afterResponse, modifikasi data hasil API
            if (options?.afterResponse && res?.data) res.data = options?.afterResponse(res.data)

            if (options?.logging) {
                console.log("After request", res)
            }

            if (options?.onAfterResponse) {
                options?.onAfterResponse(res)
            }

            setLoading(false)

            setResponse(res)

            // Simpan response API ke cache jika opsi cache aktif
            if (options?.cache) {
                const expired = moment().add(timeout, timeoutUnit).toISOString();

                const cacheData: CacheData<DRes> = {
                    data: res,
                    expired
                }
                const cache = await caches.open(cacheName);
                const response = new Response(JSON.stringify(cacheData));
                await cache.put(cacheKey, response);
            }

        }
    }, [data, api, options]);

    // Effect untuk refresh otomatis berkala jika opsi refreshInterval di-set
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

    // Effect untuk menambahkan event listener saat window/tab browser kembali fokus
    // Jika opsi refetchOnWindowFocus aktif, maka akan memanggil refresh() otomatis
    useEffect(() => {
        if (!options?.refetchOnWindowFocus) return;

        const handleFocus = () => {
            refresh();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [options?.refetchOnWindowFocus, refresh]);

    // Fungsi untuk membatalkan request API yang sedang berjalan
    const abort = () => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        setLoading(false)
    };

    // Fungsi untuk reset state loading dan response ke kondisi awal
    const clear = () => {
        setLoading(false)
        setResponse(null)
    }

    // Hasil yang dikembalikan hook, termasuk response data dan fungsi-fungsi kontrol
    const resultOptions: OptionsCallReturn<DReq, DRes> = {
        ...response,
        loading,
        refresh,
        abort,
        clear,
        response,
        clone: (newPayload: any, newConfig: any) => useApiCall(api, newPayload, newConfig)
    }

    // Return berupa tuple [data, options]
    return [
        response?.data,
        resultOptions,
    ]
}
