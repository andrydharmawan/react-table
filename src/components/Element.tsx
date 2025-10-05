import { PropsWithChildren } from "react";
import { ColumnGroupProps, ColumnProps, ColumunFooterProps, CreateColumn, CreateMasterDetail, TCellCustomProps, TCellProps } from "../types";

export const createColumn = <T,>(): CreateColumn<T> => {
    const ColumnComponent = () => {
        return <></>;
    };
    ColumnComponent.displayName = "Column-0EHliBuh9viM6ZN";
    return ColumnComponent
};

type ElementCustom<T> = TCellCustomProps<T> & { __elementProps?: ColumnProps<T> }

export const createColumnCustom = <T,>(props: ColumnProps<T>, element: ElementCustom<T>) => {
    element.displayName = "Column-Custom-0EHliBuh9viM6ZN";
    element.__elementProps = props;
    return element;
};

export const createColumnGroup = <T,>(): React.FC<ColumnGroupProps<T>> => {
    const ColumnComponent: React.FC<any> = () => {
        return <></>;
    };
    ColumnComponent.displayName = "ColumnGroup-OFC1J5zsEoirK00";
    return ColumnComponent;
};

export const createMasterDetail = <T,>(): CreateMasterDetail<T> => {
    const ColumnComponent = () => {
        return <></>;
    };
    ColumnComponent.displayName = "MasterDetail-eYbUPjmfH9DMW98";
    return ColumnComponent;
};

export const createFooter = (): React.FC<PropsWithChildren> => {
    const ColumnComponent = () => {
        return <></>;
    };
    ColumnComponent.displayName = "Footer-HoCjTyTQB5G7i3b";
    return ColumnComponent;
};

export const createColumnFooter = <T,>(): ColumunFooterProps<T> => {
    const ColumnComponent = () => {
        return <></>;
    };
    ColumnComponent.displayName = "ColumnFooter-jRq86sPBPi3H0Wu";
    return ColumnComponent;
};