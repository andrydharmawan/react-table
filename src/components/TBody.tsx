import { useLayoutEffect, useRef } from "react"
import { useBgsTable } from "../contexts/Table.context"
import { TCellProps, TCellTypeEnum, TRowProps, TRowTypeEnum } from "../types"
import TableRowProvider, { useBgsTableRow } from "../contexts/TRow.context"
import TableCellProvider from "../contexts/TCell.context"
import { getFieldValue, renderChildren, useFormatted } from "@bgscore/react-core"

export default function TBody() {
    const {
        TableBody,
        dataSource = [],
    } = useBgsTable<any[]>()

    return <>
        <TableBody>
            {(dataSource as any[]).map((rowData, rowIndex) => (
                <Row key={rowIndex} rowData={rowData} rowIndex={rowIndex} />
            ))}
        </TableBody>
    </>
}

const Row: TRowProps = ({ rowIndex, rowData }) => {
    const rowRef = useRef<HTMLTableRowElement>(null)

    const {
        TableRow,
        TableCell,
        columnsWithChild,
        masterDetail,
    } = useBgsTable<any[]>();

    return <>
        <TableRowProvider key={rowIndex} open={masterDetail?.defaultOpen} rowRef={rowRef} rowData={rowData} rowIndex={rowIndex}>
            {({ open, handleRowClick }) => <>
                <TableRow onClick={(e) => {
                    handleRowClick(e)
                }} ref={rowRef} rowData={rowData} rowIndex={rowIndex} type={TRowTypeEnum.body}>
                    {columnsWithChild.map((column, columnIndex) => (
                        <Cell key={`${columnIndex}-${rowIndex}`} {...column as any} rowIndex={rowIndex} columnIndex={columnIndex} />
                    ))}
                </TableRow>
                {open && <TableRow rowIndex={rowIndex} type={TRowTypeEnum.masterDetail}>
                    <TableCell rowIndex={rowIndex} columnIndex={0} className={masterDetail?.className} colSpan={columnsWithChild.length} type={TCellTypeEnum.masterDetail}>
                        {renderChildren(masterDetail?.children as any, { rowData, rowIndex })}
                    </TableCell>
                </TableRow>}
            </>}
        </TableRowProvider>
    </>
}

const Cell: TCellProps<unknown> = (props) => {
    const columnRef = useRef<HTMLTableCellElement>(null)
    const { rowData, rowRef } = useBgsTableRow()
    const formatted = useFormatted()

    let { sticky, dataField, rowIndex, columnIndex, dataType } = props;

    const {
        TableCell,
        children,
    } = useBgsTable();

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

        const table = columnRef.current?.closest("table");
        const colGroup = table?.querySelector("colgroup");
        const cols = colGroup ? Array.from(colGroup.children) : [];

        const resizeObserver = new ResizeObserver(() => {
            handleResize();
        });

        cols.forEach(col => resizeObserver.observe(col));

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", handleResize);
        };
    }, [sticky, rowIndex, children, rowRef.current, columnRef.current, columnIndex]);

    let value = dataField && getFieldValue(rowData, dataField);//sama bgttt - TCell.context.tsx
    if (value && dataType) {
        value = formatted(value, dataType)
    }

    return <>
        <TableCellProvider key={columnIndex} columnRef={columnRef} column={props} columnIndex={columnIndex} value={value} rowIndex={rowIndex} rowData={rowData}>
            {({ handleCellClick }) => <>
                <TableCell
                    ref={columnRef}
                    key={columnIndex}
                    {...props}
                    onClick={e => {
                        handleCellClick(e)
                        props.onClick && props.onClick(e)
                    }}
                    data-sticky={sticky}
                    type={TCellTypeEnum.body}
                >
                    {props.children ? renderChildren(props.children, { ...props, rowData, rowIndex, columnIndex, value }) : value}
                </TableCell>
            </>}
        </TableCellProvider>
    </>
}