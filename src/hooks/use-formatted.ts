import moment from "moment";
import { isNotEmpty } from "../lib/utils";
import { DataType, DataTypeEnum } from "../types";
import { useBgsCore } from "../contexts/BgsCore.context";

export type OptionsNumberProps = {
    thouSep: string;
    decSep: string;
    decDigits: number | "auto";
}

type OptionsNumber = OptionsNumberProps & {
    dataType: "number";
    method?: "round" | "ceil" | "floor";
}

type OptionsDate = {
    dataType: "date" | "dateTime" | "month" | "year" | "time";
    display: string;
    value: string;
}

type UseFormattedOptions<T extends DataType> = T extends "number" ? Partial<OptionsNumber> : T extends "date" | "dateTime" | "month" | "year" | "time" ? Partial<OptionsDate> : never;

export const useFormatted = <T extends DataType>(
    value: unknown,
    dataType: T,
    options?: UseFormattedOptions<T>
): string => {
    const { format } = useBgsCore()
    if (dataType === DataTypeEnum.number) {
        const result = formatNumber(value, {
            thouSep: format.number.thouSep,
            decDigits: format.number.decDigits,
            decSep: format.number.decSep,
            ...options
        } as OptionsNumber)
        return result
    }
    else if (["date", "dateTime", "month", "year", "time"].some(x => x === dataType)) {
        return formatDate(value as string, {
            display: (format as any)[dataType]?.display,
            value: (format as any)[dataType]?.value,
            ...options
        } as OptionsDate);
    }
    else {
        return value?.toString() as string
    }
}

function formatNumber(value: unknown, { thouSep, decSep, decDigits, method }: OptionsNumber): string {
    if (value == null || isNaN(Number(value))) {
        return '';
    }

    let numericValue: number = typeof value === 'string' ? parseFloat(value) : value as number;

    if (method) {
        if (typeof decDigits === "number") {
            const factor = Math.pow(10, decDigits);
            numericValue = Math[method](numericValue * factor) / factor;
        }
        else {
            numericValue = Math[method](numericValue);
        }
    }
    else {
        if (typeof decDigits === "number") {
            const factor = Math.pow(10, decDigits);
            numericValue = Math.floor(numericValue * factor) / factor;
        }
    }


    let detectedDecimalDigits = 0;
    if (decDigits === "auto") {
        const valueStr = numericValue.toString();
        const decimalIndex = valueStr.indexOf(".");
        if (decimalIndex !== -1) {
            detectedDecimalDigits = valueStr.length - decimalIndex - 1;
        }
    }

    const opt: Intl.NumberFormatOptions = {
        style: "decimal",
        useGrouping: true,
        minimumFractionDigits: decDigits === "auto" ? detectedDecimalDigits : decDigits || 0,
        maximumFractionDigits: decDigits === "auto" ? detectedDecimalDigits : decDigits || 0,
        minimumIntegerDigits: 1,
    };

    const formattedNumber = numericValue.toLocaleString("en-US", opt);

    return formattedNumber
        .replace(/\./g, "decSep")
        .replace(/,/g, "thouSep")
        .replace(/decSep/g, decSep)
        .replace(/thouSep/g, thouSep);
}

function formatDate(value: string, { display, value: valueFormat }: OptionsDate): string {
    if (!isNotEmpty(value)) return value;

    const result = moment(value, valueFormat, true)

    return result.isValid() ? result.format(display) : value;
}