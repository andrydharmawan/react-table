import { UseFormReturn } from "react-hook-form";
import { ControllerProps } from "../types";
import { useBgsForm } from "../contexts/Form.context";
import { useBgsFormArray } from "../contexts/Array.context";
import { labelFormatter } from "./utils";
import { useBgsReactForm } from "../contexts/Provider.context";
type PatternType = "alphabet" | "alphanumber" | "number" | "lowercase" | "url" | "uppercase" | "mixedcase" | "specialcharacters";

export interface ValidationCallback {
    message?: string | ((label: string) => string);
    validation: (value: any) => boolean | string | null | undefined | number | object;
}

export interface ValidationOptions {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    match?: string | { dataField: string; label: string };
    diff?: string | { dataField: string; label: string };
    regexp?: {
        regexp: RegExp,
        message: string
    };
    pattern?: PatternType;
    required?: boolean;
    email?: boolean;
    [x: string]: ValidationCallback | string | number | undefined | boolean | object;
}

export type ValidationRules = "required"
    | "email"
    | ValidationOptions

interface ResultValidation<T = any> {
    [x: string]: T
}
interface ValidationProps<T = any> {
    [x: string]: {
        [x: string]: T
    }
}

export default function validationRules({ validationRules, label }: ControllerProps) {
    const { formControl, getData } = useBgsForm();

    let result: ResultValidation[] = [];
    if (validationRules) {
        if (typeof validationRules === "string") {
            validationHandle(validationRules, true, label as string, formControl!, getData!, {}).forEach(x => result.push(x))
        }
        else if (typeof validationRules === "object") {
            Object.keys(validationRules).forEach(item => {
                const { validate } = result.find(x => x.validate) || {}
                const validateInclude = ["minLength", "maxLength", "min", "max", "match", "diff", "regexp", "pattern", "required", "email"]

                if (validateInclude.includes(item)) {
                    let valueValidation = validationRules[item];
                    let labelValidation = "";

                    if (item === "email" && !valueValidation) return

                    if (["match", "diff"].includes(item)) {
                        if (typeof valueValidation === "object") {
                            valueValidation = (validationRules[item] as any).dataField;
                            
                            labelValidation = (validationRules[item] as any).label;
                        }
                    }
                    
                    if(valueValidation !== null && valueValidation !== undefined) {
                        validationHandle(item, valueValidation, label as string, formControl!, getData!, validate, labelValidation).forEach(x => result.push(x))
                    }
                }
                else if (typeof validationRules[item] === "object") {
                    const option = validationRules[item] as ValidationCallback;
                    result.push({
                        validate: {
                            ...validate,
                            [item]: (value: any) => option.validation(value) || (option.message && (typeof option.message === "string" ? option.message : option.message(label as string)))
                        }
                    })
                }

            })
        }
    }
    return Object.assign({}, ...result)
}

const validationHandle = (typeValidation: string, valueValidation: any, label: string, formControl: UseFormReturn, getData: (field?: string) => any, validate: any, labelValidation?: string) => {
    let result: ResultValidation[] = [];

    const { validationMessage } = useBgsReactForm();

    const { required, minLength, maxLength, min, max, email, match, diff, pattern } = validationMessage || {};

    const validation: ValidationProps = {
        required: {
            value: !!valueValidation,
            message: required ? required(label) : `${label} is required`
        },
        minLength: {
            value: valueValidation,
            message: minLength ? minLength(label, valueValidation) : `${label} must be at least ${valueValidation} characters long`
        },
        maxLength: {
            value: valueValidation,
            message: maxLength ? maxLength(label, valueValidation) : `${label} cannot be more than ${valueValidation} characters long`
        },
        min: {
            value: Number(valueValidation),
            message: min ? min(label, valueValidation) : `${label} should be at least ${valueValidation}`
        },
        max: {
            value: Number(valueValidation),
            message: max ? max(label, valueValidation) : `${label} should be at most ${valueValidation}`
        },
        regexp: (value: string = "") => value ? (new RegExp(valueValidation.regexp).test(value)) || (`${label} ${valueValidation.message}`) : true,
        email: (value: string = "") => value ? (value.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) || (email ? email(label) : `${label} must be type email`)) : true,
        match: (value: string = "") => value ? (value === (getData && getData(valueValidation)) || (match ? match(label, labelValidation || labelFormatter.changeAll(valueValidation)) : `${label} must be same with ${labelValidation || labelFormatter.changeAll(valueValidation)}`)) : true,
        diff: (value: string = "") => value ? (!(value === (getData && getData(valueValidation))) || (diff ? diff(label, labelValidation || labelFormatter.changeAll(valueValidation)) : `${label} must be different with ${labelValidation || labelFormatter.changeAll(valueValidation)}`)) : true,
        pattern: {
            alphabet: (value: string = "") => (!!value && new RegExp("^[A-Za-z ]*$").test(value)) || (pattern?.alphabet ? pattern?.alphabet(label) : `${label} must be format Alphabet`),
            alphanumber: (value: string = "") => (!!value && new RegExp("^[A-Za-z0-9 ]*$").test(value)) || (pattern?.alphanumber ? pattern?.alphanumber(label) : `${label} must be format Alphabet or Number`),
            number: (value: string = "") => (!!value && new RegExp("^[0-9]*$").test(value)) || (pattern?.number ? pattern?.number(label) : `${label} must be format Number`),
            lowercase: (value: string = "") => (!!value && new RegExp("^[a-z0-9 ]*$").test(value)) || (pattern?.lowercase ? pattern?.lowercase(label) : `${label} must be format Lowercase`),
            url: (value = "") => (!!value && /^(ftp|http|https):\/\/[^ "]+$/.test(value)) || (pattern?.url ? pattern?.url(label) : `${label} must be a valid URL`),
            uppercase: (value = "") => (!!value && new RegExp("^[A-Z0-9 ]*$").test(value)) || (pattern?.uppercase ? pattern?.uppercase(label) : `${label} must be format Uppercase`),
            mixedcase: (value = "") => (!!value && /[a-z]/.test(value) && /[A-Z]/.test(value)) || (pattern?.mixedcase ? pattern?.mixedcase(label) : `${label} must be mixed case`),
            specialcharacters: (value = "") => (!!value && /[^a-zA-Z0-9\s]/.test(value)) || (pattern?.specialcharacters ? pattern?.specialcharacters(label) : `${label} must contain special characters`),
        }
    }

    const validationValue = validation[typeValidation];

    if (validationValue) {
        const { validate: validates } = result.find(x => x.validate) || {}
        if (typeof validationValue === "function") {
            result.push({
                validate: {
                    ...validates,
                    ...validate,
                    [typeValidation]: validationValue
                }
            })
        }
        else if (typeValidation === "pattern") {
            result.push({
                validate: {
                    ...validates,
                    ...validate,
                    [`${typeValidation}${valueValidation}`]: validationValue[valueValidation]
                }
            })
        }
        else result.push({ [typeValidation]: validationValue })
    }

    return result;
}