import React, { useImperativeHandle, useRef } from "react";
import { PropsWithChildren } from "react";
import { TableProps, TBodyProps, TCellProps, TFooterProps, THeaderProps, THeadProps, TRowProps } from "../types";
import BgsTableProvider, { BgsTableRef } from "../contexts/Table.context";
import THead from "./THead";
import TBody from "./TBody";
import TFoot from "./TFoot";

export interface BgsTableProps<T = any> {
    dataSource: T;
    Table: TableProps;
    TableHeader: THeaderProps;
    TableBody: TBodyProps;
    TableFooter: TFooterProps;
    TableRow: TRowProps;
    TableHead: THeadProps<any>;
    TableCell: TCellProps<any>;
}

type BgsTableType = <T, >(props: PropsWithChildren<BgsTableProps<T>> & { ref?: React.ForwardedRef<BgsTableRef> }) => any;

const BgsTable: BgsTableType = React.forwardRef((props, ref) => {
    const tableRef = useRef<HTMLTableElement>(null)
    const table = useRef<BgsTableRef>(null)

    const {
        children,
        Table,
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

