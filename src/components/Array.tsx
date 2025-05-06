import React, { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { DeepPartialSkipArrayKey, FieldArrayWithId, useFieldArray, UseFieldArrayAppend, UseFieldArrayInsert, UseFieldArrayMove, UseFieldArrayPrepend, UseFieldArrayRemove, UseFieldArrayReplace, UseFieldArraySwap, UseFieldArrayUpdate } from "react-hook-form";
import { FormRef, Children } from "../types";
import { useBgsForm } from "../contexts/Form.context";
import { generateUUID, renderChildren } from "../lib/utils";
import BgsFormArrayProvider from "../contexts/Array.context";


export interface FormArrayProps<T = any> {
    name: string;
    className?: string;
    defaultData?: T | T[];
    children?: Children;
}

export interface FormArrayItem extends FormArrayRef {
    index: number,
    name: string,
    countFields: number;
    watchItem<T = any>(name?: string): DeepPartialSkipArrayKey<T>;
    removeItem: () => void;
    setValueItem: (dataField: string, value: any) => void
}

export interface FormArrayRef<T = any> extends FormRef<T> {
    formArrayId: string;
    swap: UseFieldArraySwap;
    move: UseFieldArrayMove;
    prepend: UseFieldArrayPrepend<any, any>;
    append: UseFieldArrayAppend<any, any>;
    remove: UseFieldArrayRemove;
    insert: UseFieldArrayInsert<any, any>;
    update: UseFieldArrayUpdate<any, any>;
    replace: UseFieldArrayReplace<any, any>;
    fields: FieldArrayWithId<any, any, any>[];
}

const FormArray = forwardRef(<T extends any = any>({ name, className = "", defaultData, children }: FormArrayProps<T>, ref: ForwardedRef<FormArrayRef<T>>) => {
    const formRef = useBgsForm();

    const fieldArray = useFieldArray({
        control: formRef.control,
        name
    })

    useEffect(() => {
        if (fieldArray.fields.length === 0) {
            if (defaultData) fieldArray.append(defaultData)
        }
    }, [fieldArray.append, defaultData])

    const formArrayId = useMemo(() => generateUUID(), []);

    const formArrayRef = {
        formArrayId,
        ...fieldArray,
        ...formRef
    }

    useImperativeHandle(ref, () => (formArrayRef))

    return <>
        {fieldArray.fields.map((item, index) => {
            const nameMap = `${name}.${index}.`
            const props: FormArrayItem = {
                ...formArrayRef,
                index,
                name: nameMap,
                countFields: fieldArray.fields.length,
                removeItem: () => fieldArray.remove(index),
                watchItem: dataField => formRef.watch(dataField ? `${nameMap}${dataField}` : nameMap.slice(0, -1)),
                setValueItem: (dataField, value) => formRef.setValue(`${nameMap}${dataField}`, value),
            };


            return <div className={className} key={item.id}>
                <BgsFormArrayProvider {...props}>
                    {renderChildren(children, props)}
                </BgsFormArrayProvider>
            </div>
        })}
    </>
})

FormArray.displayName = "BgsFormArray";

export default FormArray;