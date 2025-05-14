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
    result.others = [];

    const traverse = (nodes: React.ReactNode) => {
        React.Children.forEach(nodes, (child) => {
            if (React.isValidElement(child)) {
                const displayName = (child.type as React.FC).displayName as T;

                if (elementNames.includes(displayName)) {
                    (result as any)[displayName] = child;
                } else {
                    const childElement = child as React.ReactElement<any>;
                    const hasChildren = childElement.props?.children;

                    if (hasChildren) {
                        traverse(childElement.props.children);
                    } else {
                        result.others!.push(child);
                    }
                }
            } else {
                result.others!.push(child);
            }
        });
    };

    traverse(children);
    return result;
};