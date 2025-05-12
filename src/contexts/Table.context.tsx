import { createContext, forwardRef, PropsWithChildren, ReactNode, useContext, useImperativeHandle } from "react";
import { BgsTableProps } from "../components/Table";
import { buildHeaderLevels, flattenColumns, parseColumns, parseFooter, parseMasterDetail } from "../lib/utils";
import { ColumnMapping, ColumnProps, FooterProps, HeaderLevel, MasterDetailProps } from "../types";
import { BgsCoreProps, useBgsCore } from "./BgsCore.context";

export interface BgsTableContextData<P = unknown, D = any> extends BgsTableProps<P, D> {
    tableRef: React.RefObject<HTMLTableElement | null>;
    child: ReactNode;
}

export interface BgsTableRef<P = unknown, D = any> extends BgsTableProps<P, D>, BgsCoreProps {
    columnsProps: ColumnMapping[];
    headers: HeaderLevel[][]
    footers: FooterProps[][];
    columns: ColumnProps<P, D>[];
    children: ReactNode;
    tableRef: React.RefObject<HTMLTableElement | null>;
    masterDetail: MasterDetailProps<P, D> | undefined;
}

const BgsTableContext = createContext<BgsTableRef | undefined>(undefined);

export function useBgsTable<P = unknown, D = any>(): BgsTableRef<P, D> {
    const context = useContext(BgsTableContext);
    if (!context) {
        return {} as BgsTableRef<P, D>;
    }
    return context as BgsTableRef<P, D>;
}

type BgsTableProviderType = <P = unknown, D = any>(props: PropsWithChildren<BgsTableContextData<P, D>> & { ref?: React.ForwardedRef<BgsTableRef> }) => any;

const BgsTableProvider: BgsTableProviderType = forwardRef(({ children, child, ...others }, ref) => {
    const columnsProps = parseColumns(child);
    const headers = buildHeaderLevels(columnsProps);
    const columns = flattenColumns(columnsProps);
    const masterDetail = parseMasterDetail(child)
    const footers = parseFooter(child)
    const bgsCore = useBgsCore()

    const value: BgsTableRef<any> = {
        ...others,
        ...bgsCore,
        columnsProps,
        headers,
        columns,
        children: child,
        masterDetail,
        footers,
    }

    useImperativeHandle(ref, () => value);

    return <BgsTableContext.Provider value={value}>
        {children}
    </BgsTableContext.Provider>
})

export default BgsTableProvider