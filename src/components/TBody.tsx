import { useLayoutEffect, useRef } from "react"
import { useBgsTable } from "../contexts/Table.context"
import { NativePropsTd, TCellProps, TCellTypeEnum, TRowProps, TRowTypeEnum } from "../types"
import TableRowProvider, { useBgsTableRow } from "../contexts/TRow.context"
import TableCellProvider from "../contexts/TCell.context"
import { getFieldValue, isNotEmpty, renderChildren, useFormatted } from "@bgscore/react-core"

export default function TBody() {
    const {
        TableBody,
        dataSource = [],
        loading,
    } = useBgsTable<any[]>()

    return <>
        <TableBody>
            <Loading />
            <NoData />
            {!loading && (dataSource as any[])?.map((rowData, rowIndex) => (
                <Row key={rowIndex} rowData={rowData} rowIndex={rowIndex} />
            ))}
        </TableBody>
    </>
}

const Row: TRowProps = ({ rowIndex, rowData }) => {
    const rowRef = useRef<HTMLTableRowElement>(null)

    const {
        TableRow,
        columnsWithChild,
        masterDetail,
    } = useBgsTable<any[]>();

    return <>
        <TableRowProvider key={rowIndex} open={masterDetail?.defaultOpen} rowRef={rowRef} rowData={rowData} rowIndex={rowIndex}>
            {({ handleRowClick }) => <>
                <TableRow
                    onClick={handleRowClick}
                    ref={rowRef}
                    rowData={rowData}
                    rowIndex={rowIndex}
                    type={TRowTypeEnum.body}
                >
                    {columnsWithChild.map((column, columnIndex) => (
                        <Cell key={`${columnIndex}-${rowIndex}`} {...column as any} rowIndex={rowIndex} columnIndex={columnIndex} />
                    ))}
                </TableRow>
                <MasterDetail rowIndex={rowIndex} rowData={rowData} />
            </>}
        </TableRowProvider>
    </>
}

const Cell: TCellProps<unknown> = (props) => {
    const columnRef = useRef<HTMLTableCellElement>(null)
    const { rowData, rowRef } = useBgsTableRow()
    const formatted = useFormatted()

    let { sticky, dataField, rowIndex, columnIndex, dataType, isCustom, format } = props;

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
    if (isNotEmpty(value) && dataType) {
        value = formatted(value, dataType, format)
    }

    const ElementCustomTd = isCustom ? props.children as unknown as any : null;

    return <>
        <TableCellProvider key={columnIndex} columnRef={columnRef} column={props} columnIndex={columnIndex} value={value} rowIndex={rowIndex} rowData={rowData}>
            {({ handleCellClick }) => {
                const nativeProps: NativePropsTd = {
                    onClick: e => {
                        handleCellClick(e)
                        props.onClick && props.onClick(e)
                    },
                    "data-sticky": sticky
                }

                return <>
                    {isCustom ?
                        <ElementCustomTd
                            ref={columnRef}
                            key={columnIndex}
                            {...props}
                            nativeProps={nativeProps}
                            type={TCellTypeEnum.body}
                        />
                        : <TableCell
                            ref={columnRef}
                            key={columnIndex}
                            {...props}
                            nativeProps={nativeProps}
                            type={TCellTypeEnum.body}
                        >
                            {props.children ? renderChildren(props.children, { ...props, rowData, rowIndex, columnIndex, value }) : value}
                        </TableCell>}
                </>
            }}
        </TableCellProvider>
    </>
}

const Loading = () => {
    const {
        TableLoading,
        loading,
        columnsWithChild,
    } = useBgsTable<any[]>()
    return <>
        {loading && (
            <tr>
                <td colSpan={columnsWithChild?.length}>
                    <TableLoading />
                </td>
            </tr>
        )}
    </>
}

const NoData = () => {
    const {
        TableNoData,
        loading,
        dataSource,
        columnsWithChild,
    } = useBgsTable<any[]>()

    const length = dataSource?.length ?? 0;

    return <>
        {(!loading && length === 0) && (
            <tr>
                <td colSpan={columnsWithChild?.length}>
                    <TableNoData />
                </td>
            </tr>
        )}
    </>
}

const MasterDetail: TRowProps = ({ rowIndex, rowData }) => {
    const {
        masterDetail,
        TableMasterDetail,
        columnsWithChild,
    } = useBgsTable<any[]>()

    return <>
        <tr>
            <td colSpan={columnsWithChild?.length}>
                <TableMasterDetail>
                    {renderChildren(masterDetail?.children as any, { rowData, rowIndex })}
                </TableMasterDetail>
            </td>
        </tr>
    </>
}