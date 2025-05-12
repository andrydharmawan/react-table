import { PropsWithChildren } from "react";
import { ColumnGroupProps, ColumunFooterProps, CreateColumn, CreateMasterDetail } from "../types";

export const createColumn = <T,>(): CreateColumn<T> => {
    const ColumnComponent = () => {
        return <></>;
    };
    ColumnComponent.displayName = "Column";
    return ColumnComponent
};

export const createColumnGroup = (): React.FC<ColumnGroupProps> => {
    const ColumnComponent: React.FC<any> = () => {
        return <></>;
    };
    ColumnComponent.displayName = "ColumnGroup";
    return ColumnComponent;
};

export const createMasterDetail = <T,>(): CreateMasterDetail<T> => {
    const ColumnComponent = () => {
        return <></>;
    };
    ColumnComponent.displayName = "MasterDetail";
    return ColumnComponent;
};

export const createFooter = (): React.FC<PropsWithChildren> => {
    const ColumnComponent = () => {
        return <></>;
    };
    ColumnComponent.displayName = "Footer";
    return ColumnComponent;
};

export const createColumnFooter = <T,>(): ColumunFooterProps<T> => {
    const ColumnComponent = () => {
        return <></>;
    };
    ColumnComponent.displayName = "ColumnFooter";
    return ColumnComponent;
};