import { QueryClient } from "@tanstack/query-core";
import {
    persistQueryClientSave,
    persistQueryClientRestore,
    Persister,
    PersistedClient,
} from "@tanstack/query-persist-client-core";
import { join } from "node:path";
import { writeFile, readFile, rm, mkdir } from "node:fs/promises";
import getAppDataPath from "appdata-path";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
        },
    },
});

const appDataPath = getAppDataPath("arenagap");
const location = join(appDataPath, "query-client.json");

const persister = {
    persistClient: async (persistedClient: PersistedClient) => {
        await mkdir(appDataPath, { recursive: true });
        await writeFile(location, JSON.stringify(persistedClient));
    },
    restoreClient: async () => {
        try {
            const file = await readFile(location, "utf-8");
            return JSON.parse(file) as PersistedClient;
        } catch (e) {
            if (e instanceof Error && "code" in e && e.code === "ENOENT") {
                return undefined;
            }

            throw e;
        }
    },
    removeClient: async () => {
        await rm(location);
    },
} satisfies Persister;

export async function saveClient() {
    await persistQueryClientSave({
        queryClient,
        persister,
    });
}

export async function restoreClient() {
    await persistQueryClientRestore({
        queryClient,
        persister,
    });
}
