import moment from "moment";
import { AxiosProgressEvent, AxiosResponse, GenericAbortSignal } from "axios";
import { PropsWithChildren } from "react";
import { BgsTableDefaultProps } from "./components/Table";
import { BgsTableRef } from "./contexts/Table.context";

export type Children<T = unknown> = ChildFunction<T> | React.ReactNode;
type ChildFunction<T = unknown> = (props: T) => Children<T>;

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

type HandleCallback<T = any> = (props: AxiosResponse<T> & { isCancel: boolean; }, err?: any) => ApiResponse;

export interface UseHelperProps {
    /** Base URL API */
    url: string;
    /** Header tambahan untuk request */
    headers?: Record<string, string>;
    /** Token autentikasi, bisa string atau null/undefined jika tidak ada */
    token?: string | null | undefined;
    /** Callback yang dijalankan setiap response atau error */
    onCallback: HandleCallback;
    /** Handler khusus jika response tidak authorized */
    onUnauthorized?: (response: ApiResponse) => void;
    /** Fungsi untuk memeriksa otorisasi response, return true jika authorized */
    handleAuthorization?: (response: ApiResponse, options?: OptionsHelper) => boolean;
     /** Fungsi untuk menampilkan toast/notification berdasarkan response */
    handleToast?: (response: ApiResponse) => void;
    /**
     * Fungsi manipulasi/preparasi data sebelum dikirim ke server.
     */
    beforeRequest?: (data: any) => any;
    /** Jika true, toast tidak ditampilkan ketika request dibatalkan */
    disabledToastWhenCancel?: boolean;
}

export interface OptionsHelper {
    /** Menampilkan toast/info ketika response success */
    infoSuccess: boolean;
    /** Menampilkan toast/info ketika response error */
    infoError: boolean;
    /** Menyisipkan Authorization token.
     *  - `true` → pakai token default dari `UseHelperProps`
     *  - `string` → pakai token string ini
     *  - `false` → tidak menyisipkan token
     */
    token: boolean | string;
    /** Header tambahan untuk request */
    headers: Record<string, string>;
    /** Signal dari AbortController, bisa dipakai untuk cancel request */
    signal: GenericAbortSignal;
    /** Response type seperti 'json', 'blob', dll */
    responseType: ResponseType;
    /** Callback ketika ada upload progress (biasanya untuk form upload) */
    onUploadProgress: (props: AxiosProgressEvent) => void;
    /** Handler saat request unauthorized (status 401/403), bisa override default */
    onUnauthorized: (response: ApiResponse) => void;
    /** Jika `true`, maka onUnauthorized tidak akan dijalankan */
    disabledHandleUnauthorized: boolean;
    /** Jika `true`, maka tidak akan munculkan toast saat request dibatalkan (abort) */
    disabledToastWhenCancel?: boolean;
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

export type OptionsCallReturn<DReq, DRes = DReq> = Partial<ApiResponse<DRes>> & {
    /** Status loading saat request berlangsung */
    loading: boolean;
    /** Menjalankan ulang request dengan payload & config sebelumnya */
    refresh: () => void;
    /** Membatalkan request yang sedang berjalan */
    abort: () => void;
    /** Clear/reset response dan status terkait */
    clear: () => void;
    /** Response dari server (bisa undefined/null jika belum ada atau sudah di-clear) */
    response: ApiResponse<DRes> | undefined | null;
    /**
     * Mengkloning call API dengan payload/config baru.
     * Cocok untuk membuat instance baru tanpa mempengaruhi state lama.
     */
    clone: <T = unknown>(newPayload?: DReq, newConfig?: Partial<UseCallOptionsProps<DReq, DRes & T>>) => UseCallReturnType<DReq, DRes>;
}

export type UseCallReturnType<DReq, DRes = DReq> = [
    DRes | undefined,
    OptionsCallReturn<DReq, DRes>
]

interface TimeoutConfig {
    value: number;
    unit: moment.DurationInputArg2
}

interface CacheProps {
    /** 
     * Nama cache yang akan digunakan sebagai container atau namespace.
     * Biasanya untuk membedakan jenis cache yang berbeda.
     */
    cacheName?: string;

    /**
     * Kunci unik untuk menyimpan dan mengambil data dari cache.
     * Biasanya merepresentasikan entri spesifik dalam cacheName.
     */
    cacheKey?: string | Array<string | number | boolean | null | undefined | Record<string, any>>;

    /**
     * Durasi timeout cache sebelum dianggap kedaluwarsa.
     * Bisa berupa angka (dalam satuan detik) atau objek konfigurasi timeout.
     */
    timeout?: number | TimeoutConfig;

    /**
     * Jika true, data cache akan dipertahankan walau halaman direfresh atau ditutup.
     * Jika false atau tidak diisi, cache akan dihapus saat halaman ditutup.
     */
    persistence?: boolean;
}

export interface CacheData<DRes> {
    /**
     * Waktu kedaluwarsa cache dalam bentuk ISO string.
     */
    expired: string;
    /**
     * Data respon API yang disimpan dalam cache.
     */
    data: ApiResponse<DRes>;
}

export interface UseCallOptionsProps<DReq, DRes> extends OptionsHelper {
    /**
     * Jika true, proses request & response akan dicetak ke console.
     */
    logging: boolean;
    /**
     * Fungsi manipulasi/preparasi data sebelum dikirim ke server.
     */
    beforeRequest: (request: DReq) => DReq;
    /**
     * Fungsi manipulasi respon dari server sebelum disimpan atau ditampilkan.
     */
    afterResponse: (response: DRes) => DRes;
    /**
     * Hook yang dijalankan sebelum request diproses.
     */
    onBeforeRequest: (request: DReq) => void;
    /**
     * Hook yang dijalankan setelah respon diterima dari server.
     */
    onAfterResponse: (response: ApiResponse<DRes>) => void;
    /**
     * Daftar dependency yang dapat memicu ulang pemanggilan API jika berubah.
     */
    trigger: any[];
    /**
     * Jika true, maka request tidak dijalankan otomatis hingga dipanggil secara manual.
     */
    hold: boolean;
    /**
     * Callback yang dipanggil setiap kali data berubah.
     */
    onChange: (data: DReq, options: OptionsCallReturn<DReq, DRes>) => void;
    /**
     * Mengaktifkan cache untuk menyimpan respon API.
     * Bisa true (default pengaturan) atau objek konfigurasi `CacheProps`.
     */
    cache: true | CacheProps;
    /**
     * Interval auto refresh data. Bisa dalam detik atau konfigurasi TimeoutConfig.
     */
    refreshInterval: number | TimeoutConfig;
    /**
     * Menentukan apakah data akan difetch ulang saat tab aktif kembali.
     */
    refetchOnWindowFocus: boolean;
}

export interface UseApiActionProps<Req, Res> extends Partial<OptionsHelper> {
    /**
     * Callback ketika respon berhasil.
     */
    onSuccess?: OnCallback<Res>;
    /**
     * Callback ketika terjadi error.
     */
    onError?: OnCallback<Res>;
    /**
     * Jika true, proses request & response akan dicetak ke console.
     */
    logging?: boolean;
    /**
     * Fungsi manipulasi sebelum request dikirim.
     */
    beforeRequest?: (request: Req) => Req;
    /**
     * Fungsi manipulasi setelah respon diterima.
     */
    afterResponse?: OnCallback<Res>;
    /**
     * Jika true, request akan otomatis dibatalkan saat komponen unmount.
     */
    abortOnUnmount?: boolean;
}

type OnCallback<T = any> = (response: ApiResponse<T>) => void

export type UseApiActionReturnType<Req, Res> = [
    (values: Req) => void,
    Partial<ApiResponse<Res>> & {
        /** Membatalkan request yang sedang berjalan */
        abort: () => void;
        /** Clear/reset response dan status terkait */
        reset: () => void;
        /** Status loading saat request berlangsung */
        loading: boolean;
        /** Progress upload/download, nilai antara 0 - 100 */
        progress: number;
    }
]

export type DataType = "number" | "date" | "dateTime" | "month" | "year" | "time" | "string" | "boolean";
export enum DataTypeEnum { number = "number", date = "date", dateTime = "dateTime", month = "month", year = "year", time = "time", string = "string", boolean = "boolean" };


export type NestedKeyOf<T> =
  T extends object
    ? T extends Array<infer U>
      ? `${number}` | `${number}.${NestedKeyOf<U>}`
      : {
          [K in keyof T]: T[K] extends Array<infer U>
            ? `${K & string}` | `${K & string}[${number}]` | `${K & string}[${number}].${NestedKeyOf<U>}`
            : T[K] extends object
              ? `${K & string}` | `${K & string}.${NestedKeyOf<T[K]>}`
              : `${K & string}`;
        }[keyof T]
    : never;


export type PathValue<T, P extends string> =
  P extends `${infer K}[${infer I}].${infer R}`
    ? K extends keyof T
      ? T[K] extends Array<infer U>
        ? PathValue<U, R>
        : never
      : never
  : P extends `${infer K}[${infer I}]`
    ? K extends keyof T
      ? T[K] extends Array<infer U>
        ? U
        : never
      : never
  : P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? PathValue<T[K], R>
      : never
  : P extends keyof T
    ? T[P]
    : never;

export type ColumnProps<
    P = unknown,
    D = any,
    K extends NestedKeyOf<D> = NestedKeyOf<D>
> = P & {
    dataField?: NestedKeyOf<D>;
    caption?: string | React.ReactNode;
    noCaption?: boolean;
    width?: string | number;
    className?: string;
    classNameHeader?: string;
    children?: Children<ColumnProps<P & ColumnData<D, P, PathValue<D, K>>>>;
    dataType?: DataType;
    sticky?: "left" | "right";
    // allowResizing?: boolean;
}

export type ColumnMapping = ColumnProps & {
    subColumns?: ColumnProps[]
}

export type ColumnGroupProps<T = unknown> = T & {
    caption?: string | React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    sticky?: "left" | "right";
}

export interface HeaderLevel extends ColumnMapping {
    colSpan: number;
    rowSpan: number;
    hasSubColumns: boolean;
}

export type TableProps = React.ComponentType<React.ComponentProps<"table"> & {
}>

export type THeaderProps = React.ComponentType<React.ComponentProps<"thead"> & {
}>

export type TBodyProps = React.ComponentType<React.ComponentProps<"tbody"> & {
}>

export type TFooterProps = React.ComponentType<React.ComponentProps<"tfoot"> & {
}>

export type TRowType = "head" | "body" | "foot" | "master-detail";

export enum TRowTypeEnum {
    head = "head",
    body = "body",
    foot = "foot",
    masterDetail = "master-detail"
};

export type TCellType = "body" | "foot" | "master-detail";

export enum TCellTypeEnum {
    body = "body",
    foot = "foot",
    masterDetail = "master-detail"
};

export type TRowProps<T = any, P = unknown> = React.ComponentType<React.ComponentProps<"tr"> & P & {
    rowIndex: number;
    rowData?: T;
    type?: TRowType
}>

export type THeadProps<T = unknown> = React.ComponentType<React.ComponentProps<"th"> & ColumnProps<T> & {
    columnIndex: number;
    rowIndex: number;
}>

export type TCellProps<T = unknown> = React.ComponentType<React.ComponentProps<"td"> & ColumnProps<T> & {
    columnIndex: number;
    rowIndex: number;
    type?: TCellType;
}>

export type RowData<T = any> = {
    rowIndex: number;
    rowData: T;
}

export type ColumnData<D = unknown, P = any, V = any> = RowData<D> & {
    column: ColumnProps<P, D>;
    columnIndex: number;
    value: V
}

export type CreateColumn<P = unknown> = {
    <D = any, K extends NestedKeyOf<D> = NestedKeyOf<D>>(props: ColumnProps<P, D, K>): React.JSX.Element;
};

export type CreateMasterDetail<P = unknown> = {
    <D = any>(props: MasterDetailProps<P, D>): React.JSX.Element;
};

export type MasterDetailProps<
    P = unknown,
    D = any,
> = {
    className?: string;
    defaultOpen?: boolean;
    children?: Children<ColumnProps<P & RowData<D>>>;
}

export type ColumunFooterProps<T = unknown> = React.ComponentType<FooterProps<T>>

export type FooterType = "sum" | "avg" | "count" | "max" | "min";
export enum FooterTypeEnum {
    sum = "sum",
    avg = "avg",
    count = "count",
    max = "max",
    min = "min"
};

export type FooterProps<T = unknown> = Omit<React.ComponentProps<"td">, "colSpan" | "columnIndex"> & T & {
    sticky?: "left" | "right";
    children?: React.ReactNode;
    dataField?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    type?: FooterType;
    colSpan?: true | number;
}

export type ElementType<T> = T extends (infer U)[] ? U : T;

export type BgsTableProps<P = unknown, D = any> = Omit<BgsTableDefaultProps<P, D>, "Table" | "TableBody" | "TableCell" | "TableFooter" | "TableHead" | "TableHeader" | "TableRow">;
export type BgsTableComponent = <P = unknown, D = any>(props: PropsWithChildren<BgsTableProps<P, D>> & { ref?: React.ForwardedRef<BgsTableRef<P, D>> }) => any;