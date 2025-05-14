import React from "react";

export type CreateElementProps<P = unknown> = {
    (element: (props: P) => React.JSX.Element, elementName: string): React.FC<P>;
};

export const createElement = <T,>(element: (props: T) => React.JSX.Element, elementName: string): React.FC<T> => {
    const ColumnComponent: React.FC<T> = (props) => {
        return element(props);
    };

    ColumnComponent.displayName = elementName;
    return ColumnComponent;
};

export type SplitElementResult<T extends string> = {
    [K in T]?: React.ReactNode;
} & {
    others?: React.ReactNode[];
};

export const splitElement = <T extends string>(
    children: React.ReactNode,
    elementNames: T[]
): SplitElementResult<T> => {
    const result: SplitElementResult<T> = {} as SplitElementResult<T>;

    React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type) {
            const displayName = (child.type as React.FC).displayName as T;

            if (elementNames.some(x => x === displayName)) {
                (result as any)[displayName] = child as React.ReactNode;
            } else {
                if (!result.others) result.others = [];
                result.others.push(child);
            }
        }
    });

    return result;
};