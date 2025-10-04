// src/global.d.ts
export { };
import "react";

declare module "react" {
    interface FunctionComponent<P = {}> {
        __elementProps?: any;
    }

    interface ForwardRefExoticComponent<P> {
        __elementProps?: any;
    }

    interface MemoExoticComponent<T> {
        __elementProps?: any;
    }

    interface JSXElementConstructor<P> {
        __elementProps?: any;
    }
}
