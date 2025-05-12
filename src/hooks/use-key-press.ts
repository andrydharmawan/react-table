import { useEffect, useState } from "react";

export type CombinationType = "ctrl" | "alt" | "shift";

export function useKeyPress(targetKey: string | number, combination?: CombinationType | CombinationType[], stopPropagation?: boolean) {
    //https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/

    const [keyPressed, setKeyPressed] = useState<boolean>(false);

    const condition = (key: string, keyCode: number) => {
        if (typeof targetKey === "string" && key === targetKey) return true;
        if (typeof targetKey === "number" && keyCode === targetKey) return true;
        return false;
    }

    const isFormElement = (element: Element | null): boolean => {
        const formElements = ["INPUT", "TEXTAREA", "SELECT", "BUTTON"];
        return element !== null && (formElements.includes(element.tagName) || element.hasAttribute("contentEditable"));
    };

    const downHandler = (props: KeyboardEvent) => {
        const { key, keyCode } = props;
        const ctrlPressed = props.ctrlKey;
        const altPressed = props.altKey;
        const shiftPressed = props.shiftKey;

        if (isFormElement(document.activeElement)) {
            return;
        }

        if (combination) {
            if (typeof combination === "string") {
                if (condition(key, keyCode) && ((combination === "ctrl" && ctrlPressed) || (combination === "alt" && altPressed) || (combination === "shift" && shiftPressed))) {
                    props.preventDefault();
                    if (stopPropagation) props.stopPropagation();
                    setKeyPressed(!keyPressed);
                }
            } else {
                const allCombinationsPressed = combination.every(combo => {
                    if (combo === "ctrl") return ctrlPressed;
                    if (combo === "alt") return altPressed;
                    if (combo === "shift") return shiftPressed;
                    return false;
                });

                if (condition(key, keyCode) && allCombinationsPressed) {
                    props.preventDefault();
                    if (stopPropagation) props.stopPropagation();
                    setKeyPressed(!keyPressed);
                }
            }
        } else {
            if (condition(key, keyCode)) {
                props.preventDefault();
                if (stopPropagation) props.stopPropagation();
                setKeyPressed(!keyPressed);
            }
        }
    }

    const upHandler = ({ key, keyCode }: KeyboardEvent) => {
        if (condition(key, keyCode)) setKeyPressed(false);
    };

    useEffect(() => {
        window.addEventListener("keydown", downHandler);
        window.addEventListener("keyup", upHandler);

        return () => {
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
    }, []);

    return keyPressed;
}