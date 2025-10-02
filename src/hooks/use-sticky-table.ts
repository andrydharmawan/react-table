import { useCallback, useLayoutEffect } from "react";

export type StickyTableOptions = {
    classNames: {
        base: string;          // common class for both sides
        left: string;          // optional additional class for left
        right: string;         // optional additional class for right
        hidden: string;        // class to hide border (default: 'hidden')
    };
    deps: any[];
    onChange?: (state: {
        start: boolean;
        end: boolean;
        table: HTMLTableElement;
        container: HTMLDivElement;
    }) => void;
};

export function useStickyTable(
    containerRef: React.RefObject<HTMLDivElement | null>,
    tableRef: React.RefObject<HTMLTableElement | null>,
    options: StickyTableOptions
) {
    const ensureBorder = useCallback((el: HTMLElement, side: "left" | "right", show: boolean) => {
        const attr = `[data-border="${side}"]`;
        let border = el.querySelector(attr) as HTMLSpanElement | null;

        if (!border) {
            border = document.createElement("span");
            border.setAttribute("data-border", side);
            const sideClass = side === "left" ? options.classNames.left : options.classNames.right;
            border.className = [options.classNames.base, sideClass].filter(Boolean).join(" ");
            el.appendChild(border);
        }

        border.classList.toggle(options.classNames.hidden, !show);
    }, [options.classNames]);

    const evaluateStickyEdges = useCallback(() => {
        const container = containerRef.current;
        const table = tableRef.current;

        if (!table || !container) return;

        const scrollLeft = container.scrollLeft ?? 0;
        const offsetWidth = container.offsetWidth ?? 0;
        const scrollWidth = container.scrollWidth ?? 0;

        const start = scrollLeft > 0;
        const end = scrollLeft + offsetWidth < scrollWidth;

        const rows = table.querySelectorAll("tr");
        for (const row of rows) {
            const leftStickies = row.querySelectorAll<HTMLElement>(`th[data-sticky="left"], td[data-sticky="left"]`);
            const rightStickies = row.querySelectorAll<HTMLElement>(`th[data-sticky="right"], td[data-sticky="right"]`);

            if (leftStickies.length > 0) {
                ensureBorder(leftStickies[leftStickies.length - 1], "left", start);
            }
            if (rightStickies.length > 0) {
                ensureBorder(rightStickies[0], "right", end);
            }
        }
        options.onChange?.({ start, end, table, container });
    }, [containerRef, tableRef, ensureBorder, options]);

    useLayoutEffect(() => {
        const tableEl = tableRef.current;
        if (!tableEl) return;

        window.addEventListener("resize", evaluateStickyEdges);
        evaluateStickyEdges();

        const resizeObserver = new ResizeObserver(() => {
            evaluateStickyEdges();
        });

        resizeObserver.observe(tableEl);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", evaluateStickyEdges);
        };
    }, [evaluateStickyEdges, ...options.deps]);

    return evaluateStickyEdges;
}