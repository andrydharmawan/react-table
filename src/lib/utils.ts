import { Children, NestedKeyOf } from "../types";
import React, { PropsWithChildren } from "react";
import { ColumnGroupProps, ColumnMapping, ColumnProps, FooterProps, HeaderLevel, MasterDetailProps } from "../types";

export function generateUUID() {
    const random = () => (Math.random() * 16) % 16 | 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => (c === 'x' ? random() : (random() & 0x3 | 0x8)).toString(16));
}

export function diffJson(data1: any, data2: any) {
    try {
        return JSON.stringify(data1) !== JSON.stringify(data2);
    } catch (error) {
        return false;
    }
}


export const mappingUndefinedtoNull = (values: any) => {
    Object.keys(values).forEach(field => {
        if (values[field] === undefined) values[field] = null
    })

    return values;
}

export function isArray(data: any, length?: number): boolean {
    let result = false;
    if (data) {
        if (typeof data === "object") {
            if (Array.isArray(data)) {
                if (typeof length === "number") {
                    if (data.length > length) {
                        result = true;
                    }
                } else {
                    result = true;
                }
            }
        }
    }
    return result;
}


export function isNotEmpty(value: unknown): boolean {
    // Check if the value is null or undefined
    if (value == null) return false;

    // Check if the value is an empty string
    if (typeof value === "string" && value.trim() === "") return false;

    // Check if the value is an empty array
    if (Array.isArray(value) && value.length === 0) return false;

    // Check if the value is an empty object
    if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0
    ) {
        return false;
    }

    // If none of the above, return true
    return true;
}



function isColumn<DRes>(
    element: React.ReactNode
): element is React.ReactElement<ColumnProps<DRes>> {
    return (
        React.isValidElement(element) &&
        typeof element.type === "function" &&
        (element.type as React.FC).displayName === "Column"
    );
}

function isColumnGroup(
    element: React.ReactNode
): element is React.ReactElement<ColumnGroupProps> {
    return (
        React.isValidElement(element) &&
        typeof element.type === "function" &&
        (element.type as React.FC).displayName === "ColumnGroup"
    );
}

function isMasterDetail(
    element: React.ReactNode
): element is React.ReactElement<MasterDetailProps> {
    return (
        React.isValidElement(element) &&
        typeof element.type === "function" &&
        (element.type as React.FC).displayName === "MasterDetail"
    );
}

function isFooter(
    element: React.ReactNode
): element is React.ReactElement<PropsWithChildren> {
    return (
        React.isValidElement(element) &&
        typeof element.type === "function" &&
        (element.type as React.FC).displayName === "Footer"
    );
}

function isColumnFooter(
    element: React.ReactNode
): element is React.ReactElement<FooterProps> {
    return (
        React.isValidElement(element) &&
        typeof element.type === "function" &&
        (element.type as React.FC).displayName === "ColumnFooter"
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
                const { children, ...others } = child.props
                result.push({
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



export const labelFormatter = {
    camelCase: (value: string = "") => {
        value = value.split(".").map(val => {
            val = val.charAt(0).toUpperCase() + val.slice(1)
            return val
        }).join(" ")
        value = value.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
        return value.charAt(0).toUpperCase() + value.slice(1);
    },
    snackCase: (value: string = "") => {
        const camelCase = value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

        let camelWithSpaces = camelCase.replace(/([A-Z])/g, ' $1');

        camelWithSpaces = camelWithSpaces.charAt(0).toUpperCase() + camelWithSpaces.slice(1);

        return camelWithSpaces;
    },
    changeAll: (value: string = "", capShortWords: boolean = false) => {
        let result = "";

        try {
            value = value?.split(".")[value?.split(".")?.length - 1];
            value = value?.split("[]")[value?.split("[]")?.length - 1];

            result = labelFormatter.snackCase(labelFormatter.camelCase(value));

            if (capShortWords) result = result?.split(" ")
                ?.map(word => word?.length <= 3 ? word?.toUpperCase() : word)
                ?.join(" ");

        } catch (error) {

        }

        return result?.trim();
    }
}


export function renderChildren<T = unknown>(children: Children, props: T): any {
    return typeof children === "function" ? children(props) : children;
};

export const getFieldValue = (arr: any, str: any, defaultValue: any = null): any => {
    if (!arr) return "";
    if (str.includes(".")) return getFieldValue(arr[str.substring(0, str.indexOf("."))], str.substring(str.indexOf(".") + 1));
    return arr ? arr[str] : defaultValue;
}


export const sorting = {
    desc: <T,>(data: T[], field?: NestedKeyOf<T>): T[] => {
        if (!data) data = [];
        return data.sort((a: any, b: any) => {
            if (field) {
                const a1 = getFieldValue(a, field) ? getFieldValue(a, field) : "";
                const b1 = getFieldValue(b, field) ? getFieldValue(a, field) : "";
                return a1 < b1 ? 1 : -1;
            }
            else {
                return a < b ? 1 : -1;
            }
        });
    },
    asc: <T,>(data: T[], field?: NestedKeyOf<T>): T[] => {
        if (!data) data = [];
        return data.sort((a: any, b: any) => {
            if (field) {
                const a1 = getFieldValue(a, field) ? getFieldValue(a, field) : "";
                const b1 = getFieldValue(b, field) ? getFieldValue(b, field) : "";
                return a1 > b1 ? 1 : -1;
            }
            else {
                return a > b ? 1 : -1;
            }
        })
    }
}

export const summary = <T,>(data: T[], field?: NestedKeyOf<T>): number => {
    if (!Array.isArray(data)) data = [];

    let dataMapAccumulation: number[] = [];

    dataMapAccumulation = data.map(item => field ? Number(getFieldValue(item, field) || 0) : Number(item || 0));

    return dataMapAccumulation.reduce((total, num) => {
        return (total || 0) + (num || 0);
    }, 0) || 0;
}

export function jsonCopy<T,>(data: T): T {
    try {

        if (data) return JSON.parse(JSON.stringify(data));

        return data
    } catch (error) {
        return data;
    }
}
