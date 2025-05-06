import { createContext, PropsWithChildren, useCallback, useContext, useRef, useState } from "react";
import { Controller, ControllerProps, FormRef } from "../types";


export interface BgsFormControllerContextData extends ControllerProps {
    controller: Controller;
}

const BgsFormControllerContext = createContext<BgsFormControllerContextData | undefined>(undefined);

export function useBgsFormController<T = unknown>(): BgsFormControllerContextData & T {
    const context = useContext(BgsFormControllerContext);
    if (!context) {
        return {} as BgsFormControllerContextData & T;
    }
    return context as BgsFormControllerContextData & T;
}

export default function BgsFormControllerProvider({ children, ...others }: PropsWithChildren<BgsFormControllerContextData>) {
    return <BgsFormControllerContext.Provider value={others}>
        {children}
    </BgsFormControllerContext.Provider>
}