import { useSyncExternalStore } from "react";

type Listener = () => void;

export function createStore<T>(initialState: T) {
    let state = initialState;
    const listeners = new Set<Listener>();

    function getSnapshot() {
        return state;
    }

    function subscribe(listener: Listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }

    function setState(newState: T | ((prev: T) => T)) {
        if (typeof newState === "function") {
            state = (newState as (prev: T) => T)(state);
        } else {
            state = newState;
        }
        listeners.forEach((listener) => listener());
    }

    // Hook untuk subscribe ke store dan ambil seluruh state
    function useStore(): T;
    // Hook untuk subscribe ke bagian tertentu (selector)
    function useStore<K>(selector: (state: T) => K): K;
    function useStore<K>(selector?: (state: T) => K) {
        return useSyncExternalStore(
            subscribe,
            () => (selector ? selector(state) : state),
            () => (selector ? selector(state) : state)
        );
    }

    return {
        getSnapshot,
        subscribe,
        setState,
        useStore,
    };
}
