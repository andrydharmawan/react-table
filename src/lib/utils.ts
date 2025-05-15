import { Children, NestedKeyOf, PathValue } from "../types";
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

export const getFieldValue = <T, P extends NestedKeyOf<T>, D = undefined>(obj: T, path: P, defaultValue: D = "" as D): PathValue<T, P> | D => {
    if (!obj) return defaultValue;

    // If the full path is a key in the object, return it directly
    if (obj.hasOwnProperty(path)) {
        return (obj as any)[path];
    }

    // Normal nested access
    const pathParts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let current = obj;

    for (const part of pathParts) {
        if (current == null) return defaultValue;
        current = (current as any)[part];
    }

    return current === undefined ? defaultValue : current as any;
}

export const sorting = {
    desc: <T,>(data: T[], field?: NestedKeyOf<T>): T[] => {
        if (!data) data = [];
        return data.sort((a: any, b: any) => {
            if (field) {
                const a1 = getFieldValue(a, field) ? getFieldValue(a, field) : "";
                const b1 = getFieldValue(b, field) ? getFieldValue(a, field) : "";
                return a1! < b1! ? 1 : -1;
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
                return a1! > b1! ? 1 : -1;
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
