import { createContext, useContext, useState } from "react";
import { BgsTableRef, useBgsTable } from "./Table.context";
import { Children, RowData } from "../types";
import { renderChildren } from "../lib/utils";

export type TableRowReturnData<P = unknown, D = any> = RowData<D> & BgsTableRef<P, D> & {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    toggleOpen: () => void;
    rowRef: React.RefObject<HTMLTableRowElement | null>;
    handleRowClick: React.MouseEventHandler<HTMLTableRowElement>;

}

const BgsTableContext = createContext<TableRowReturnData | undefined>(undefined);

export function useBgsTableRow<P = unknown, D = any>(): TableRowReturnData<P, D> {
    const context = useContext(BgsTableContext);
    if (!context) {
        return {} as TableRowReturnData<P, D>;
    }
    return context as TableRowReturnData<P, D>;
}

type TableRowProviderProps<P = unknown, D = any> = RowData & {
    children?: Children<TableRowReturnData<P, D>>
    rowRef: React.RefObject<HTMLTableRowElement | null>;
    open?: boolean;
}

export default function TableRowProvider<P = unknown, D = any>({ children, open: openDefault = false, ...others }: TableRowProviderProps<P, D>) {
    const table = useBgsTable()
    const [open, setOpen] = useState<boolean>(openDefault);

    const handleRowClick: React.MouseEventHandler<HTMLTableRowElement> = (event) => {
        // table.onRowClick && table.onRowClick({ event, ...value })
    }

    const value: TableRowReturnData = {
        ...others,
        ...table,
        open,
        setOpen,
        toggleOpen: () => setOpen(prev => !prev),
        handleRowClick,
    }

    return <BgsTableContext.Provider value={value}>
        {renderChildren(children as any, value)}
    </BgsTableContext.Provider>
}