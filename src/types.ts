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
    url: string;
    headers?: Record<string, string>;
    token?: string | null | undefined;
    onCallback: HandleCallback;
    onUnauthorized?: (response: ApiResponse) => void;
    handleAuthorization?: (response: ApiResponse, options?: OptionsHelper) => boolean;
    handleToast?: (response: ApiResponse) => void;
    beforeRequest?: (data: any) => any;
    disabledToastWhenCancel?: boolean;
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
    loading: boolean;
    refresh: () => void;
    abort: () => void;
    clear: () => void;
    response: ApiResponse<DRes> | undefined | null
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
    cacheName: string;

    /**
     * Kunci unik untuk menyimpan dan mengambil data dari cache.
     * Biasanya merepresentasikan entri spesifik dalam cacheName.
     */
    cacheKey: string;

    /**
     * Durasi timeout cache sebelum dianggap kedaluwarsa.
     * Bisa berupa angka (dalam satuan detik) atau objek konfigurasi timeout.
     */
    timeout: number | TimeoutConfig;

    /**
     * Jika true, data cache akan dipertahankan walau halaman direfresh atau ditutup.
     * Jika false atau tidak diisi, cache akan dihapus saat halaman ditutup.
     */
    persistence?: boolean;
}

export interface CacheData<DRes> {
    expired: string;
    data: ApiResponse<DRes>;
}

export interface UseCallOptionsProps<DReq, DRes> extends OptionsHelper {
    logging: boolean;
    beforeRequest: (request: DReq) => DReq;
    afterResponse: (response: DRes) => DRes;
    onBeforeRequest: (request: DReq) => void;
    onAfterResponse: (response: ApiResponse<DRes>) => void;
    trigger: any[];
    hold: boolean;
    onChange: (data: DReq, options: OptionsCallReturn<DReq, DRes>) => void;
    cache: CacheProps;
    refreshInterval: number | TimeoutConfig;
}

export interface UseApiActionProps<Req, Res> extends Partial<OptionsHelper> {
    onSuccess?: OnCallback<Res>;
    onError?: OnCallback<Res>;
    logging?: boolean;
    beforeRequest?: (request: Req) => Req;
    afterResponse?: OnCallback<Res>;
    abortOnUnmount?: boolean;
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