import { useEffect, useRef } from "react";

export function useInterval<P extends Function>(
    callback: P,
    { interval, lead }: { interval: number; lead?: boolean },
): void {
    let savedCallback = useRef<any>(null);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect((): any => {
        const tick = (): void => savedCallback.current();

        lead && tick();

        if (interval !== null) {
            const id = setInterval(tick, interval);

            return () => clearInterval(id);
        }
    }, [interval]);
}
