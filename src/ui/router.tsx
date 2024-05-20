import { Box, Text, useApp, useInput } from "ink";
import { Results } from "./results";
import { appStateStore, useAppState } from "../state";
import Spinner from "ink-spinner";

export function Router() {
    const state = useAppState();

    const app = useApp();
    useInput((input, key) => {
        if ((key.ctrl && input === "c") || key.escape || input === "q") {
            app.exit();
        }
    });

    if (state.type === "loading") {
        return (
            <Box width="100%" justifyContent="center" alignItems="center">
                <Text color="green">
                    <Spinner type="dots" />
                </Text>
                <Text> {state.text}</Text>
            </Box>
        );
    }

    return <Results />;
}
