import { createContext, useContext } from "react";
import { ColumnProps } from "../types";
import { Children, NestedKeyOf, } from "@bgscore/react-core";
import { renderChildren } from "@bgscore/react-core";
import { BgsTableRef, useBgsTable } from "./Table.context";

export type TableHeadReturnData<P = unknown, D = any, K extends NestedKeyOf<D> = NestedKeyOf<D>> = ColumnProps<P, D, K> & BgsTableRef<P, D> & TableHeadProviderProps & {
}

const BgsTableContext = createContext<TableHeadReturnData | undefined>(undefined);

export function useBgsTableColumnHead<P = unknown, D = any, K extends NestedKeyOf<D> = NestedKeyOf<D>>(): TableHeadReturnData<P, D, K> {
    const context = useContext(BgsTableContext);
    if (!context) {
        return {} as TableHeadReturnData<P, D, K>;
    }

    return context as TableHeadReturnData<P, D, K>;
}

type TableHeadProviderProps<P = unknown, D = any> = {
    columnRef: React.RefObject<HTMLTableCellElement | null>;
    children?: Children<TableHeadReturnData<P, D>>
    columnIndex: number;
    rowIndex: number;
}

export default function TableColumnHeadProvider({ children, ...others }: TableHeadProviderProps) {
    const table = useBgsTable()

    const value: TableHeadReturnData = {
        ...table,
        ...others,
    }

    return <BgsTableContext.Provider value={value}>
        {renderChildren(children as any, value)}
    </BgsTableContext.Provider>
}