import { createContext, PropsWithChildren, useContext } from "react";
import { OptionsNumberProps } from "../hooks/use-formatted";

type FormatType = { display: string; value: string; }

type FormatContextProps = {
    date: FormatType;
    month: FormatType;
    year: FormatType;
    dateTime: FormatType;
    time: FormatType;
    number: OptionsNumberProps;
}

export type BgsCoreProps = {
    format: FormatContextProps;
}

const BgsCoreContext = createContext<BgsCoreProps | undefined>(undefined);

export function useBgsCore(): BgsCoreProps {
    const context = useContext(BgsCoreContext);
    if (!context) {
        return {} as BgsCoreProps;
    }
    return context;
}

interface BgsCoreProvider {
    value: BgsCoreProps;
}

export const BgsCoreProvider = ({ children, value: options }: PropsWithChildren<BgsCoreProvider>) => {
    const value: BgsCoreProps = {
        ...options,
    }

    return <BgsCoreContext.Provider value={value}>
        {children}
    </BgsCoreContext.Provider>
}