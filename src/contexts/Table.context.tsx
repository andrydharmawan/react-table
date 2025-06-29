import { createContext, forwardRef, PropsWithChildren, ReactNode, useContext, useImperativeHandle, useMemo } from "react";
import { BgsTableDefaultProps } from "../components/Table";
import { buildHeaderLevels, flattenColumns, parseColumns, parseFooter, parseMasterDetail } from "../lib/utils.internal";
import { ColumnMapping, ColumnProps, FooterProps, HeaderLevel, MasterDetailProps } from "../types";
import { BgsCoreProps, useBgsCore } from "@bgscore/react-core";

export interface BgsTableContextData<P = unknown, D = any> extends BgsTableDefaultProps<P, D> {
    tableRef: React.RefObject<HTMLTableElement | null>;
    child: ReactNode;
}

export interface BgsTableRef<P = unknown, D = any> extends BgsTableDefaultProps<P, D>, BgsCoreProps {
    columnsProps: ColumnMapping[];
    headers: HeaderLevel[][]
    footers: FooterProps[][];
    columnsWithChild: ColumnProps<P, D>[];
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
    const bgsCore = useBgsCore()
    const columnsProps = useMemo(() => parseColumns(child), [child]);
    const headers = useMemo(() => buildHeaderLevels(columnsProps), [columnsProps]);
    const columnsWithChild = useMemo(() => flattenColumns(columnsProps), [columnsProps]);
    const columns = useMemo(() => columnsWithChild.map(({ children, ...others }) => others), [columnsWithChild]);
    const masterDetail = useMemo(() => parseMasterDetail(child), [child])
    const footers = useMemo(() => parseFooter(child), [child])

    const value: BgsTableRef<any> = {
        ...others,
        ...bgsCore,
        columnsProps,
        headers,
        columnsWithChild,
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