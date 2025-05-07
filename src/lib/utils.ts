import { Children } from "../types";

export function generateUUID() {
    const random = () => (Math.random() * 16) % 16 | 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => (c === 'x' ? random() : (random() & 0x3 | 0x8)).toString(16));
}

export function renderChildren<T = unknown>(children: Children, props: T): any {
    return typeof children === "function" ? children(props) : children;
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
        const camelCase = value.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());

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

        return result;
    }
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

export const getFieldValue = (arr: any, str: string): any => {
    if (!arr) return "";
    if (str.includes(".")) return getFieldValue(arr[str.substring(0, str.indexOf("."))], str.substring(str.indexOf(".") + 1));
    return arr ? arr[str] : null;
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