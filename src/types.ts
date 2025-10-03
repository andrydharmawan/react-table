import { Children, NestedKeyOf, PathValue, SupportedFormattedType } from "@bgscore/react-core";
import { PropsWithChildren } from "react";
import { BgsTableDefaultProps } from "./components/Table";
import { BgsTableRef } from "./contexts/Table.context";

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
    dataType?: SupportedFormattedType;
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

export type TLoadingProps = React.ComponentType<React.ComponentProps<"div"> & {
}>

export type TNoDataProps = React.ComponentType<React.ComponentProps<"div"> & {
}>

export type TMasterDetailProps = React.ComponentType<React.ComponentProps<"div"> & {
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
