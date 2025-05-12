import { createContext, useContext } from "react";
import { Children, ColumnData, PathValue, NestedKeyOf } from "../types";
import { TableRowReturnData, useBgsTableRow } from "./TRow.context";
import { renderChildren, getFieldValue } from "../lib/utils";

export type TableCellReturnData<P = unknown, D = any, K extends NestedKeyOf<D> = NestedKeyOf<D>> = ColumnData<D, P, PathValue<D, K>> & TableRowReturnData<P, D> & {
    columnRef: React.RefObject<HTMLTableCellElement | null>;
}

const BgsTableContext = createContext<TableCellReturnData | undefined>(undefined);

export function useBgsTableColumn<P = unknown, D = any, K extends NestedKeyOf<D> = NestedKeyOf<D>>(dataField: NestedKeyOf<D>): TableCellReturnData<P, D, K> {
    const context = useContext(BgsTableContext);
    if (!context) {
        return {} as TableCellReturnData<P, D, K>;
    }

    if (dataField) context.value = getFieldValue(context.rowData, dataField)//sama bgttt - TBody.tsx

    return context as TableCellReturnData<P, D, K>;
}

type TableCellProviderProps<P = unknown, D = any> = ColumnData & {
    columnRef: React.RefObject<HTMLTableCellElement | null>;
    children?: Children<TableCellReturnData<P, D>>
}    


export default function TableCellProvider({ children, ...others }: TableCellProviderProps) {
    const row = useBgsTableRow()
    const value: TableCellReturnData = {
        ...row,
        ...others,
    }

    return <BgsTableContext.Provider value={value}>
        {renderChildren(children as any, value)}
    </BgsTableContext.Provider>
}