import { useLayoutEffect, useRef } from "react"
import { useBgsTableColumnHead } from "../contexts/THead.context";

export type ResizeColumnProps = {
    gripClassName: string;
    lineClassName: string;
};

export const ResizeColumn = ({
    gripClassName,
    lineClassName,
}: ResizeColumnProps) => {
    const { columnRef, columnIndex } = useBgsTableColumnHead();
    const handleRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            const startX = e.clientX;
            const startWidth = columnRef.current?.offsetWidth || 0;

            const table = columnRef.current?.closest("table");
            const tableRect = table?.getBoundingClientRect();
            const cellRect = columnRef.current?.getBoundingClientRect();

            if (!table || !tableRect || !cellRect) return;

            let resizeLine = table.parentElement?.querySelector("[data-resize-column]") as HTMLElement | null;

            if (!resizeLine) {
                resizeLine = document.createElement("span");
                resizeLine.setAttribute("data-resize-column", "true");
                resizeLine.className = lineClassName;
                resizeLine.style.position = "absolute";
                resizeLine.style.display = "none";
                resizeLine.style.height = `${table.offsetHeight}px`;
                table.parentElement?.appendChild(resizeLine);
            }

            resizeLine.style.display = "block";
            resizeLine.style.left = `${cellRect.right - tableRect.left - 4}px`;
            resizeLine.style.height = `${table.offsetHeight}px`;

            const onMouseMove = (e: MouseEvent) => {
                const newWidth = startWidth + (e.clientX - startX);
                const col = table.querySelector("colgroup")?.children[columnIndex] as HTMLTableColElement | undefined;
                if (col) {
                    col.style.width = `${newWidth}px`;

                    const newCellRight = columnRef.current?.getBoundingClientRect().right || 0;
                    resizeLine!.style.left = `${newCellRight - tableRect.left - 4}px`;
                }
            };

            const onMouseUp = () => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
                if (resizeLine) resizeLine.style.display = "none";
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        };

        const handle = handleRef.current;
        if (handle) {
            handle.addEventListener("mousedown", handleMouseDown);
        }

        return () => {
            if (handle) {
                handle.removeEventListener("mousedown", handleMouseDown);
            }
        };
    }, [columnRef, columnIndex, handleRef]);

    return (
        <div
            ref={handleRef}
            className={gripClassName}
        />
    );
};