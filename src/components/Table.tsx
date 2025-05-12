import React, { useImperativeHandle, useRef } from "react";
import { PropsWithChildren } from "react";
import { TableProps, TBodyProps, TCellProps, TFooterProps, THeaderProps, THeadProps, TRowProps } from "../types";
import BgsTableProvider, { BgsTableRef } from "../contexts/Table.context";
import THead from "./THead";
import TBody from "./TBody";
import TFoot from "./TFoot";
import { useBgsCore } from "../contexts/BgsCore.context";

export interface BgsTableProps<T = any> {
    dataSource: T;
    // onRowClick?: (props: TableRowReturnData<P, ElementType<D>> & { event: React.MouseEvent<HTMLTableRowElement, MouseEvent> }) => void;
    // onCellClick?: (props: TableCellReturnData<P, ElementType<D>> & { event: React.MouseEvent<HTMLTableCellElement, MouseEvent> }) => void;
}

type BgsTableType = <P = unknown, D = any>(props: PropsWithChildren<BgsTableProps<D>> & { ref?: React.ForwardedRef<BgsTableRef<P, D>> }) => any;

const BgsTable: BgsTableType = React.forwardRef((props, ref) => {
    const tableRef = useRef<HTMLTableElement>(null)
    const table = useRef<BgsTableRef<any>>(null)
    const { Table } = useBgsCore()

    const {
        children,
    } = props;

    useImperativeHandle(ref, () => table.current!);
    
    return <>
        <BgsTableProvider {...props} child={children} tableRef={tableRef} ref={table}>
            <Table ref={tableRef}>
                <THead />
                <TBody />
                <TFoot />
            </Table>
        </BgsTableProvider>
    </>
})

export default BgsTable;

