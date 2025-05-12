import React, { useImperativeHandle, useRef } from "react";
import { PropsWithChildren } from "react";
import BgsTableProvider, { BgsTableRef } from "../contexts/Table.context";
import THead from "./THead";
import TBody from "./TBody";
import TFoot from "./TFoot";
import { useBgsCore } from "../contexts/BgsCore.context";
import { TableRowReturnData } from "../contexts/TRow.context";
import { TableCellReturnData } from "../contexts/TCell.context";

export interface BgsTableProps<P = unknown, D = any> {
    dataSource: D;
    onRowClick?: (props: TableRowReturnData<P, D> & React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void;
    onCellClick?: (props: TableCellReturnData<P, D> & React.MouseEvent<HTMLTableCellElement, MouseEvent>) => void;
}

type BgsTableType = <P = unknown, D = any>(props: PropsWithChildren<BgsTableProps<P, D>> & { ref?: React.ForwardedRef<BgsTableRef<P, D>> }) => any;

const BgsTable: BgsTableType = React.forwardRef((props, ref) => {
    const tableRef = useRef<HTMLTableElement>(null)
    const table = useRef<BgsTableRef<any>>(null)
    const { Table } = useBgsCore()

    const {
        children,
    } = props;

    useImperativeHandle(ref, () => table.current!);

    return <>
        <BgsTableProvider {...props as BgsTableProps} child={children} tableRef={tableRef} ref={table}>
            <Table ref={tableRef}>
                <THead />
                <TBody />
                <TFoot />
            </Table>
        </BgsTableProvider>
    </>
})

export default BgsTable;

