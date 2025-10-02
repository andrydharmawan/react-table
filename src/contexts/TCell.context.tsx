import { createContext, useContext } from "react";
import { ColumnData, ColumnProps } from "../types";
import { Children, PathValue, NestedKeyOf } from "@bgscore/react-core";
import { TableRowReturnData, useBgsTableRow } from "./TRow.context";
import { renderChildren, getFieldValue } from "@bgscore/react-core";

export type TableCellReturnData<P = unknown, D = any, K extends NestedKeyOf<D> = NestedKeyOf<D>> = ColumnProps<P, D, K> & ColumnData<D, P, PathValue<D, K>> & TableRowReturnData<P, D> & {
    columnRef: React.RefObject<HTMLTableCellElement | null>;
    handleCellClick: React.MouseEventHandler<HTMLTableCellElement>;
}

const BgsTableContext = createContext<TableCellReturnData | undefined>(undefined);

export function useBgsTableColumn<P = unknown, D = any, K extends NestedKeyOf<D> = NestedKeyOf<D>>(): TableCellReturnData<P, D, K> {
    const context = useContext(BgsTableContext);

    if (!context) {
        return {} as TableCellReturnData<P, D, K>;
    }

    return context as TableCellReturnData<P, D, K>;
}

type TableCellProviderProps<P = unknown, D = any> = ColumnData & {
    columnRef: React.RefObject<HTMLTableCellElement | null>;
    children?: Children<TableCellReturnData<P, D>>
}


export default function TableCellProvider({ children, ...others }: TableCellProviderProps) {
    const row = useBgsTableRow()

    const handleCellClick: React.MouseEventHandler<HTMLTableCellElement> = (event) => {
        row.onCellClick && row.onCellClick({ event, ...value })
    }
    const value: TableCellReturnData = {
        ...row,
        ...others,
        handleCellClick,
    }

    return <BgsTableContext.Provider value={value}>
        {renderChildren(children as any, value)}
    </BgsTableContext.Provider>
}