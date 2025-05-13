import { createContext, PropsWithChildren, useContext } from "react";
import { OptionsNumberProps } from "../hooks/use-formatted";
import { TableProps, TBodyProps, TCellProps, TFooterProps, THeaderProps, THeadProps, TRowProps } from "../types";

export type FormatType = { display: string; value: string; }

export type FormatContextProps = {
    date: FormatType;
    month: FormatType;
    year: FormatType;
    dateTime: FormatType;
    time: FormatType;
    number: OptionsNumberProps;
}

export type ComponentTable = {
    Table: TableProps;
    TableHeader: THeaderProps;
    TableBody: TBodyProps;
    TableFooter: TFooterProps;
    TableRow: TRowProps;
    TableHead: THeadProps<any>;
    TableCell: TCellProps<unknown>;
}

export interface BgsCoreProps {
    format: FormatContextProps;
    componentTable: () => ComponentTable;
}

const BgsCoreContext = createContext<BgsCoreProps | undefined>(undefined);

export function useBgsCore(): BgsCoreProps {
    const context = useContext(BgsCoreContext);
    if (!context) {
        return {} as BgsCoreProps;
    }
    return context;
}

export const BgsCoreProvider = ({ children, ...value }: PropsWithChildren<BgsCoreProps>) => {
    return <BgsCoreContext.Provider value={value}>
        {children}
    </BgsCoreContext.Provider>
}