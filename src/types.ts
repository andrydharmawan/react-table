import { ReactNode } from "react";
import { ControllerFieldState, ControllerRenderProps, FieldValues, UseFormStateReturn, EventType, UseFormReturn, UseFieldArrayReturn, DeepPartialSkipArrayKey } from "react-hook-form";

interface FormDefaultProps {
    disabled?: boolean;
    readOnly?: boolean;
    name?: string;
}

export interface FormProps<T = unknown> extends FormDefaultProps {
    children?: Children;
    formData?: Partial<T>;
    onSubmit?: OnSubmit<T>;
    className?: string;
    onChange?: (values: T, event: {
        name?: string | undefined;
        type?: EventType | undefined;
    }) => void
}

export interface FormRef<T = unknown> extends FormDefaultProps, Omit<UseFormReturn, "reset"> {
    reset: (field?: string | string[]) => void;
    updateData: (values: Partial<T>) => void;
    getData: (field?: string) => T;
    triggerSubmit: (addValues?: T, options?: OptionsSubmit) => void;
    formControl: UseFormReturn;
    useFieldArray: (name: string) => UseFieldArrayReturn;
    useWatch: UseWatch<T>;
    isSubmit: boolean;
    formId: string;
    name?: string;
}

export interface ControllerProps {
    dataField: string;
    validationRules?: ValidationRules;
    label?: string | ReactNode;
    noLabel?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    readOnly?: boolean;
}

export type Children = ChildFunction | React.ReactNode;
type ChildFunction = <T = unknown>(props: T) => Children;

export type BgsFormType = <T, >(props: FormProps<T> & { ref?: React.RefObject<FormRef<T>> }) => any;

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


export interface Controller {
    field: ControllerRenderProps<FieldValues, string>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<FieldValues>;
}

export interface OptionsSubmit {
    validate?: boolean
}

interface OnSubmitOptions<T = any> extends FormRef<T>, OptionsSubmit {

}

export type OnSubmit<T = any> = (values: T, options: OnSubmitOptions) => void

type UseWatch<T = any> = (name: string) => DeepPartialSkipArrayKey<T>

type Options<T = any> = (key: "onChange", value: T) => void