import React from "react";
import { createContext, PropsWithChildren, useContext } from "react";
import { FormGroupProps } from "../components/Group";
import { FormRef } from "../types";

export type BgsFormGroupData = FormGroupProps & FormRef & {
    formGroupId: string;
}

const BgsFormGroupContext = createContext<BgsFormGroupData | undefined>(undefined);

export function useBgsFormGroup(): BgsFormGroupData {
    const context = useContext(BgsFormGroupContext);
    if (!context) {
        return {} as BgsFormGroupData;
    }
    return context;
}

export default function BgsFormGroupProvider({ children, ...others }: PropsWithChildren<BgsFormGroupData>) {
    return <BgsFormGroupContext.Provider value={others}>
        {children}
    </BgsFormGroupContext.Provider>
}