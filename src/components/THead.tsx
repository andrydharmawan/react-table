import { useEffect, useRef } from "react"
import { useBgsTable } from "../contexts/Table.context"
import { THeadProps, TRowTypeEnum } from "../types"
import TableColumnHeadProvider from "../contexts/THead.context"

export default function THead() {
    const {
        TableHeader,
        TableRow,
        columns,
        headers,
    } = useBgsTable()

    return <>
        <colgroup>
            {columns.map(({ width }, index) => <col key={index} style={width ? { width } : {}} />)}
        </colgroup>
        <TableHeader>
            {headers.map((level, levelIndex) => (
                <TableRow key={levelIndex} rowIndex={levelIndex} type={TRowTypeEnum.head}>
                    {level.map(({ hasSubColumns, ...header }, headerIndex) => <Cell {...header as any} rowIndex={levelIndex} columnIndex={headerIndex} key={headerIndex} />)}
                </TableRow>
            ))}
        </TableHeader>

    </>
}

const Cell: THeadProps<unknown> = (props) => {
    const columnRef = useRef<HTMLTableCellElement>(null)

    let { sticky, caption, rowIndex, columnIndex } = props;

    const {
        TableHead,
        tableRef,
        children,
    } = useBgsTable();

    useEffect(() => {
        const handleResize = () => {
            const current = columnRef.current;
            if (!current || !sticky) return;

            const tr = tableRef.current?.querySelectorAll("thead tr")[rowIndex];
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

        const col = tableRef.current?.querySelector("colgroup")?.children[columnIndex];

        const resizeObserver = new ResizeObserver(() => {
            handleResize();
        });

        col && resizeObserver.observe(col);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", handleResize);
        };
    }, [sticky, rowIndex, tableRef.current, children, columnIndex]);

    return <>
        <TableColumnHeadProvider {...props} columnIndex={columnIndex} columnRef={columnRef} rowIndex={rowIndex}>
            <TableHead {...props} ref={columnRef} data-sticky={sticky}>
                {caption}
            </TableHead>
        </TableColumnHeadProvider>
    </>
}