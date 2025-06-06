import { useLayoutEffect, useRef } from "react"
import { useBgsTable } from "../contexts/Table.context"
import { ColumunFooterProps, FooterProps, TCellTypeEnum, TRowProps, TRowTypeEnum } from "../types"

export default function TFoot() {
    const {
        TableFooter,
        footers
    } = useBgsTable()

    return <>
        <TableFooter>
            {footers?.map((columns, rowIndex) => (
                <Row key={rowIndex} rowIndex={rowIndex} columns={columns} />
            ))}
        </TableFooter>
    </>
}

const Row: TRowProps<any, { columns: FooterProps[] }> = ({ rowIndex, columns }) => {
    const rowRef = useRef<HTMLTableRowElement>(null)

    const {
        TableRow,
    } = useBgsTable<any[]>();

    return <>
        <TableRow ref={rowRef} type={TRowTypeEnum.foot} key={rowIndex} rowIndex={rowIndex}>
            {columns.map((column, columnIndex) => (
                <Cell rowRef={rowRef} columnIndex={columnIndex} rowIndex={rowIndex} key={columnIndex} {...column} />
            ))}
        </TableRow>
    </>
}

const Cell: ColumunFooterProps<{
    rowRef: React.RefObject<HTMLTableRowElement | null>;
    rowIndex: number;
    columnIndex: number;
}> = (props) => {
    const columnRef = useRef<HTMLTableCellElement>(null)

    let { sticky, rowIndex, columnIndex, rowRef, colSpan, prefix, suffix, dataField, type, ...others } = props;

    const {
        TableCell,
        tableRef,
        children,
        columnsWithChild,
    } = useBgsTable();

    if (typeof colSpan === "boolean" && colSpan) colSpan = columnsWithChild.length;

    useLayoutEffect(() => {
        const handleResize = () => {
            const current = columnRef.current;
            if (!current || !sticky) return;

            const tr = rowRef.current;
            if (!tr) return;

            const children = Array.from(tr.children) as HTMLElement[];
            const domIndex = children.indexOf(current);
            if (domIndex === -1) return;

            const stickyColumns = children.map((el) => ({
                width: el.offsetWidth,
                sticky: el.dataset.sticky as "left" | "right" | undefined
            }));

            const width = stickyColumns.reduce((sum, col, index) => {
                const isMatchingSticky = col.sticky === sticky;
                const isBeforeOrAfter = sticky === "left" ? index < domIndex : index > domIndex;
                return isMatchingSticky && isBeforeOrAfter ? sum + col.width : sum;
            }, 0);

            current.style.position = "sticky";
            current.style.zIndex = "1";
            current.style[sticky] = `${width}px`;
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        const colGroup = tableRef.current?.querySelector("colgroup");
        const cols = colGroup ? Array.from(colGroup.children) : [];

        const resizeObserver = new ResizeObserver(() => {
            handleResize();
        });

        cols.forEach(col => resizeObserver.observe(col));

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", handleResize);
        };
    }, [sticky, rowIndex, tableRef.current, children, rowRef.current, columnRef.current]);

    return <>
        <TableCell columnIndex={columnIndex} rowIndex={rowIndex} ref={columnRef} key={columnIndex} {...others} colSpan={colSpan} data-sticky={sticky} type={TCellTypeEnum.foot}>
            {prefix}{props.children}{suffix}
        </TableCell>
    </>
}