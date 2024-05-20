import { AnalysisResult } from "./algorithm";
import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";

export type AppState = ResultState | LoadingState;

export type LoadingState = {
    type: "loading";
    text: string;
};

export type ResultState = {
    type: "result";
    ally: number;
    bans: number[];
    enemies: number[];
    analysisResults: Record<string, AnalysisResult>;
};

export const appStateStore = createStore<AppState>((set) => ({
    type: "loading",
    text: "Loading data...",
    setLoading: (state: Omit<LoadingState, "type">) =>
        set({
            type: "loading",
            ...state,
        }),
    setResult: (state: Omit<ResultState, "type">) =>
        set({
            type: "result",
            ...state,
        }),
}));

export const useAppState = () => useStore(appStateStore);

export const useLoadingState = () => {
    const appState = useAppState();
    if (appState.type !== "loading") {
        throw new Error("Invalid state");
    }
    return appState;
};

export const useResultState = () => {
    const appState = useAppState();
    if (appState.type !== "result") {
        throw new Error("Invalid state");
    }
    return appState;
};
