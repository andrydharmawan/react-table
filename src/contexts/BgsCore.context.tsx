import { createContext, PropsWithChildren, useContext } from "react";
import { OptionsNumberProps } from "../hooks/use-formatted";
import { TableProps, TBodyProps, TCellProps, TFooterProps, THeaderProps, THeadProps, TRowProps } from "../types";

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
    Table: TableProps;
    TableHeader: THeaderProps;
    TableBody: TBodyProps;
    TableFooter: TFooterProps;
    TableRow: TRowProps;
    TableHead: THeadProps<any>;
    TableCell: TCellProps<unknown>;
}

const BgsCoreContext = createContext<BgsCoreProps | undefined>(undefined);

export function useBgsCore(): BgsCoreProps {
    const context = useContext(BgsCoreContext);
    if (!context) {
        return {} as BgsCoreProps;
    }
    return context;
}

interface BgsCoreProviderProps {
    value: BgsCoreProps;
}

export const BgsCoreProvider = ({ children, value: options }: PropsWithChildren<BgsCoreProviderProps>) => {
    const value: BgsCoreProps = {
        ...options,
    }

    return <BgsCoreContext.Provider value={value}>
        {children}
    </BgsCoreContext.Provider>
}