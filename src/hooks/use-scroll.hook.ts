import { useCallback, useEffect, useRef, useState } from "react";

type Direction = "vertical" | "horizontal";

export function useScroll<T extends HTMLDivElement>(direction: Direction = "vertical") {
    const ref = useRef<T>(null);
    const [showStartShadow, setShowStartShadow] = useState(false);
    const [showEndShadow, setShowEndShadow] = useState(false);

    const handleScroll = useCallback(() => {
        const el = ref.current;
        if (!el) return;

        if (direction === "vertical") {
            const current = Math.ceil(el.scrollTop + el.clientHeight);
            const total = Math.floor(el.scrollHeight);
            setShowStartShadow(el.scrollTop > 0);
            setShowEndShadow(current < total);
        } 
        else {
            const current = Math.ceil(el.scrollLeft + el.clientWidth);
            const total = Math.floor(el.scrollWidth);
            setShowStartShadow(el.scrollLeft > 0);
            setShowEndShadow(current < total);
        }
    }, [direction]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        handleScroll();

        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    return {
        ref,
        showStartShadow,
        showEndShadow,
    };
}
