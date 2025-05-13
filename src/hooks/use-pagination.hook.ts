import * as React from "react";

export interface UsePaginationProps {
    /** Number of always visible pages at the beginning and end. */
    boundaryCount?: number;
    /** The total number of pages. */
    count?: number;
    /** The page selected by default when uncontrolled. */
    defaultPage?: number;
    /** If true, the component is disabled. */
    disabled?: boolean;
    /** If true, hide the next-page button. */
    hideNextButton?: boolean;
    /** If true, hide the previous-page button. */
    hidePrevButton?: boolean;
    /** Callback fired when the page is changed. */
    onChange?: (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>, page: number) => void;
    /** The current page (controlled). */
    page?: number;
    /** If true, show the first-page button. */
    showFirstButton?: boolean;
    /** If true, show the last-page button. */
    showLastButton?: boolean;
    /** Number of always visible pages before and after the current page. */
    siblingCount?: number;
}

export type UsePaginationItemType =
    | "page"
    | "first"
    | "last"
    | "next"
    | "previous"
    | "start-ellipsis"
    | "end-ellipsis";

export interface UsePaginationItem {
    onClick: (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => void;
    type: UsePaginationItemType;
    page: number | null;
    selected: boolean;
    disabled: boolean;
    "aria-current"?: "page";
}

export interface UsePaginationResult {
    items: UsePaginationItem[];
}

export function usePagination(
    props: UsePaginationProps = {}
): UsePaginationResult {
    const {
        boundaryCount = 1,
        count = 1,
        defaultPage = 1,
        disabled = false,
        hideNextButton = false,
        hidePrevButton = false,
        onChange,
        page: controlledPage,
        showFirstButton = false,
        showLastButton = false,
        siblingCount = 1,
    } = props;

    // Internal state for uncontrolled mode
    const [internalPage, setInternalPage] = React.useState(defaultPage);
    const page = controlledPage !== undefined ? controlledPage : internalPage;

    // Update internal state if defaultPage changes and uncontrolled
    React.useEffect(() => {
        if (controlledPage === undefined) {
            setInternalPage(defaultPage);
        }
    }, [defaultPage, controlledPage]);

    const handleClick = (
        event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>,
        value: number
    ) => {
        if (controlledPage === undefined) {
            setInternalPage(value);
        }
        onChange?.(event, value);
    };

    const range = (start: number, end: number): number[] => {
        const length = end - start + 1;
        return Array.from({ length }, (_, i) => start + i);
    };

    const startPages = range(1, Math.min(boundaryCount, count));
    const endPages = range(
        Math.max(count - boundaryCount + 1, boundaryCount + 1),
        count
    );

    const siblingsStart = Math.max(
        Math.min(
            page - siblingCount,
            count - boundaryCount - siblingCount * 2 - 1
        ),
        boundaryCount + 2
    );

    const siblingsEnd = Math.min(
        Math.max(
            page + siblingCount,
            boundaryCount + siblingCount * 2 + 2
        ),
        count - boundaryCount - 1
    );

    const itemList: Array<number | UsePaginationItemType> = [
        ...(showFirstButton ? (["first"] as UsePaginationItemType[]) : []),
        ...(hidePrevButton ? [] : (["previous"] as UsePaginationItemType[])),
        ...startPages,
        ...(siblingsStart > boundaryCount + 2
            ? (["start-ellipsis"] as UsePaginationItemType[])
            : boundaryCount + 1 < count - boundaryCount
                ? [boundaryCount + 1]
                : []),
        ...range(siblingsStart, siblingsEnd),
        ...(siblingsEnd < count - boundaryCount - 1
            ? (["end-ellipsis"] as UsePaginationItemType[])
            : count - boundaryCount > boundaryCount
                ? [count - boundaryCount]
                : []),
        ...endPages,
        ...(hideNextButton ? [] : (["next"] as UsePaginationItemType[])),
        ...(showLastButton ? (["last"] as UsePaginationItemType[]) : []),
    ];

    const buttonPage = (type: UsePaginationItemType): number | null => {
        switch (type) {
            case "first":
                return 1;
            case "previous":
                return page - 1;
            case "next":
                return page + 1;
            case "last":
                return count;
            default:
                return null;
        }
    };

    const items: UsePaginationItem[] = itemList.map((item) => {
        if (typeof item === "number") {
            return {
                onClick: (event) => handleClick(event, item),
                type: "page",
                page: item,
                selected: item === page,
                disabled,
                "aria-current": item === page ? "page" : undefined,
            };
        }

        const type = item as UsePaginationItemType;
        const pageNumber = buttonPage(type);
        return {
            onClick: (event) => handleClick(event, pageNumber!),
            type,
            page: pageNumber,
            selected: false,
            disabled:
                disabled ||
                (!type.includes("ellipsis") &&
                    (type === "next" || type === "last" ? page >= count : page <= 1)),
        };
    });

    return { items };
}
