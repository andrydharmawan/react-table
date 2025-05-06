import { createContext, PropsWithChildren, useContext } from "react";

export interface BgsReactFormContextData {
    validationMessage?: {
        visibleLabel?: boolean;
        required?: (label: string) => string
        minLength?: (label: string, value: string) => string
        maxLength?: (label: string, value: string) => string
        min?: (label: string, value: string) => string
        max?: (label: string, value: string) => string
        email?: (label: string) => string
        match?: (label: string, value: string) => string
        diff?: (label: string, value: string) => string
        pattern?: {
            alphabet?: (label: string) => string
            alphanumber?: (label: string) => string
            number?: (label: string) => string
            lowercase?: (label: string) => string
            url?: (label: string) => string
            uppercase?: (label: string) => string
            mixedcase?: (label: string) => string
            specialcharacters?: (label: string) => string
        }
    }
}

const BgsReactFormContext = createContext<BgsReactFormContextData | undefined>(undefined);

export function useBgsReactForm(): BgsReactFormContextData {
    const context = useContext(BgsReactFormContext);
    if (!context) {
        return {} as BgsReactFormContextData;
    }
    return context;
}

export default function BgsReactFormProvider({ children, ...value }: PropsWithChildren<BgsReactFormContextData>) {
    return <BgsReactFormContext.Provider value={value}>
        {children}
    </BgsReactFormContext.Provider>
}