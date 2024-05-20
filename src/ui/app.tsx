import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../query-client";
import { Router } from "./router";

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router />
        </QueryClientProvider>
    );
}
