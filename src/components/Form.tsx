import React, { FormEvent, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import BgsFormProvider from "../contexts/Form.context";
import { BgsFormType, FormRef, OptionsSubmit } from "../types";
import { diffJson, generateUUID, getFieldValue, isArray, mappingUndefinedtoNull, renderChildren } from "../lib/utils";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

const BgsForm: BgsFormType = forwardRef(({
    children,
    className,
    formData,
    onChange = () => { },
    onSubmit,
}, ref) => {

    if (!formData) formData = {};
    
    const formDataBefore = useRef<any>(undefined);
    const formElement = useRef<HTMLFormElement>(null);
    const [isSubmit, setIsSubmit] = useState<boolean>(false)
    
    const formControl = useForm({
        reValidateMode: "onSubmit",
        mode: "all",
        defaultValues: formData as any,
    });

    const formId = useMemo(() => generateUUID(), []);

    useEffect(() => {
        if (formData) {
            const isDiff = diffJson(formDataBefore.current || {}, formData)

            if (isDiff) {
                formControl.reset(formData);
                formDataBefore.current = formData;
            }
        }
    }, [formData, formControl.reset]);

    useEffect(() => {
        const subscription = formControl.watch(onChange);
        return () => subscription.unsubscribe();
    }, []);

    const onSubmitHandle = async (e?: FormEvent<HTMLFormElement>, addValues?: any, options?: OptionsSubmit) => {
        const { validate = true, ...othersOptions } = options || {}
        
        if (e) {
            e.preventDefault()
            e.stopPropagation();
        }

        setIsSubmit(true)
        const isValid = validate ? await formControl.trigger() : true;

        const values = getData()
        
        if (isValid && onSubmit) onSubmit({ ...values, ...addValues }, { ...formRef, ...othersOptions, validate })
    }

    const getData = (field?: string) => {
        return field ? getFieldValue(mappingUndefinedtoNull(formControl.getValues()), field) : mappingUndefinedtoNull(formControl.getValues())
    }

    const reset: FormRef["reset"] = (fields) => {
        if (fields) {
            if (typeof fields === "string") formControl.resetField(fields, {})
            else if (typeof fields === "object" && isArray(fields, 0)) fields.forEach(field => formControl.resetField(field))
        }
        else formControl.reset()
    }

    const formRef: FormRef<any> = {
        ...formControl,
        reset,
        updateData: values => {
            const data = getData();
            formControl.reset({
                ...data,
                ...values
            })
        },
        getData,
        triggerSubmit: (values, options) => onSubmitHandle(undefined, values, options),
        formControl,
        useFieldArray: (name) => useFieldArray({
            control: formControl.control,
            name
        }),
        useWatch: name => useWatch({
            control: formControl.control,
            name
        }),
        isSubmit,
        formId,
    }

    useImperativeHandle(ref, () => formRef);

    return <BgsFormProvider {...formRef}>
        <form id={formId} className={className} ref={formElement} onSubmit={onSubmitHandle}>
            {renderChildren(children, formRef)}
        </form>
    </BgsFormProvider>
});

export default BgsForm;