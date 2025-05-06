import { createContext, PropsWithChildren, useCallback, useContext, useRef, useState } from "react";
import { ControllerProps, FormRef } from "../types";

type ControllerWithKey = ControllerProps & { id: string; };

export interface BgsFormContextData<T = any> extends FormRef<T> {
    registerItem: (ref: ControllerWithKey) => void;
    unregisterItem: (id: string) => void;
    items: ControllerWithKey[];
}

const BgsFormContext = createContext<BgsFormContextData | undefined>(undefined);

export function useBgsForm(): BgsFormContextData {
    const context = useContext(BgsFormContext);
    if (!context) {
        return {} as BgsFormContextData;
    }
    return context;
}

export default function BgsFormProvider({ children, ...others }: PropsWithChildren<FormRef>) {
    const itemRefs = useRef<ControllerWithKey[]>([]);

    const registerItem = useCallback((item: ControllerWithKey) => {
        const findIndex = itemRefs.current.findIndex((i) => i.id === item.id);
        if (findIndex > -1) {
            const newItems = [...itemRefs.current];
            newItems[findIndex] = item;
            itemRefs.current = [...newItems];
        }
        else{
            itemRefs.current.push(item);
        }
    }, [itemRefs]);

    const unregisterItem = useCallback((id: string) => {
        itemRefs.current = itemRefs.current.filter(item => item.id !== id);
    }, []);

    const value: BgsFormContextData = {
        ...others,
        registerItem,
        unregisterItem,
        items: itemRefs.current,
    }
    
    return <BgsFormContext.Provider value={value}>
        {children}
    </BgsFormContext.Provider>
}