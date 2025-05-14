import React, { PropsWithChildren } from "react";
import { ColumnGroupProps, ColumnMapping, ColumnProps, FooterProps, HeaderLevel, MasterDetailProps } from "../types";
import { labelFormatter } from "./utils";


function isColumn<DRes>(
    element: React.ReactNode
): element is React.ReactElement<ColumnProps<DRes>> {
    return (
        React.isValidElement(element) &&
        typeof element.type === "function" &&
        (element.type as React.FC).displayName === "Column-0EHliBuh9viM6ZN"
    );
}

function isColumnGroup(
    element: React.ReactNode
): element is React.ReactElement<ColumnGroupProps> {
    return (
        React.isValidElement(element) &&
        typeof element.type === "function" &&
        (element.type as React.FC).displayName === "ColumnGroup-OFC1J5zsEoirK00"
    );
}

function isMasterDetail(
    element: React.ReactNode
): element is React.ReactElement<MasterDetailProps> {
    return (
        React.isValidElement(element) &&
        typeof element.type === "function" &&
        (element.type as React.FC).displayName === "MasterDetail-eYbUPjmfH9DMW98"
    );
}

function isFooter(
    element: React.ReactNode
): element is React.ReactElement<PropsWithChildren> {
    return (
        React.isValidElement(element) &&
        typeof element.type === "function" &&
        (element.type as React.FC).displayName === "Footer-HoCjTyTQB5G7i3b"
    );
}

function isColumnFooter(
    element: React.ReactNode
): element is React.ReactElement<FooterProps> {
    return (
        React.isValidElement(element) &&
        typeof element.type === "function" &&
        (element.type as React.FC).displayName === "ColumnFooter-jRq86sPBPi3H0Wu"
    );
}

// Recursive parser
export function parseColumns<DRes>(
    children: React.ReactNode
): ColumnMapping[] {
    const result: ColumnMapping[] = []

    React.Children.toArray(children)
        .filter(React.isValidElement)
        .forEach((child) => {
            if (isColumn(child)) {
                let caption = child.props.caption;

                if (!caption && !child.props.noCaption && child.props.dataField) caption = labelFormatter.changeAll(child.props.dataField);

                result.push({
                    ...child.props,
                    caption,
                })
            } else if (isColumnGroup(child)) {
                const { children, className, ...others } = child.props
                result.push({
                    classNameHeader: className,
                    ...(others as ColumnGroupProps),
                    subColumns: parseColumns<DRes>(children),
                })
            }
        });

    return result;
}

export function parseMasterDetail(
    children: React.ReactNode
): MasterDetailProps | undefined {
    let result: MasterDetailProps | undefined;

    React.Children.toArray(children)
        .filter(React.isValidElement)
        .forEach((child) => {
            if (isMasterDetail(child)) {
                result = { ...child.props }
            }
        });

    return result;
}

function parseFooterProps(
    children: React.ReactNode
): FooterProps[] {
    const result: FooterProps[] = []

    React.Children.toArray(children)
        .filter(React.isValidElement)
        .forEach((child) => {
            if (isColumnFooter(child)) {
                result.push(child.props)
            }
        });

    return result;
}

export function parseFooter(
    children: React.ReactNode
): FooterProps[][] {
    let result: FooterProps[][] = [];

    React.Children.toArray(children)
        .filter(React.isValidElement)
        .forEach((child) => {
            if (isFooter(child)) {
                const foot = parseFooterProps(child.props.children)
                result.push(foot)
            }
        });

    return result;
}

export function buildHeaderLevels(
    items: ColumnMapping[]
): HeaderLevel[][] {
    const countColumns = (item: ColumnMapping): number => {
        if (!item.subColumns?.length) return 1;
        return item.subColumns.reduce((sum, subItem) => sum + countColumns(subItem), 0);
    };

    const buildLevels = (
        currentItems: ColumnMapping[],
        currentLevel: number,
        levels: HeaderLevel[][] = []
    ): HeaderLevel[][] => {
        if (!levels[currentLevel]) levels[currentLevel] = [];

        currentItems.forEach(item => {
            const hasSubColumns = !!item.subColumns?.length;
            const colspan = countColumns(item);

            const headerLevel: HeaderLevel = {
                ...item,
                colSpan: colspan,
                rowSpan: 1, // temporary value
                hasSubColumns
            };

            levels[currentLevel].push(headerLevel);

            if (hasSubColumns) {
                buildLevels(item.subColumns!, currentLevel + 1, levels);
            }
        });

        return levels;
    };

    const levels = buildLevels(items, 0, []);
    const totalLevels = levels.length;

    levels.forEach((level, levelIndex) => {
        level.forEach(header => {
            header.rowSpan = header.hasSubColumns ? 1 : totalLevels - levelIndex;
        });
    });

    return levels;
}

export const flattenColumns = (columns: ColumnMapping[]): ColumnProps[] => {
    return columns.flatMap(col =>
        col.subColumns?.length
            ? flattenColumns(col.subColumns)
            : [col]
    );
};

