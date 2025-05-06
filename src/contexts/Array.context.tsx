import React from "react";
import { createContext, PropsWithChildren, useContext } from "react";
import { useFieldArray } from "react-hook-form";
import { FormArrayItem } from "../components/Array";
import { useBgsForm } from "./Form.context";

export interface BgsFormArrayContextData extends FormArrayItem {
}

const BgsFormArrayContext = createContext<BgsFormArrayContextData | undefined>(undefined);

export function useBgsFormArray(name?: string): BgsFormArrayContextData {
    const context = useContext(BgsFormArrayContext);

    if (name) {
        const formRef = useBgsForm();

        const fieldArray = useFieldArray({
            control: formRef?.formControl.control,
            name
        })

        return {
            formArrayId: "",
            name,
            index: -1,
            ...fieldArray,
            ...formRef,
            countFields: fieldArray.fields.length,
            removeItem: () => { },
            watchItem: () => ({ } as any),
            setValueItem: () => { },
        }
    }

    if (!context) {
        return {} as BgsFormArrayContextData;
    }
    return context;
}

export default function BgsFormArrayProvider({ children, ...others }: PropsWithChildren<BgsFormArrayContextData>) {
    return <BgsFormArrayContext.Provider value={others}>
        {children}
    </BgsFormArrayContext.Provider>
}