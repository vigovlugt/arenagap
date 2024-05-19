import { getData, getTierlistData } from "./lolalytics-data";
import { getChampions, getVersions } from "./ddragon";
import { queryClient } from "./query-client";

export function versionsQuery() {
    return {
        queryKey: ["ddragon", "versions"],
        queryFn: async () => {
            return getVersions();
        },
        staleTime: 1000 * 60 * 60 * 24,
    } as const;
}

export function championsQuery(patch: string) {
    return {
        queryKey: ["ddragon", "champions", patch],
        queryFn: async () => {
            return await getChampions(patch);
        },
        staleTime: 1000 * 60 * 60 * 24,
    } as const;
}

export function championQuery(championKey: number, patch: string) {
    return {
        queryKey: ["lolalytics", "champion", patch, championKey],
        queryFn: async () => {
            const ddragonData = await queryClient.fetchQuery(
                championsQuery(patch)
            );

            return getData(ddragonData, championKey, patch);
        },
        staleTime: 1000 * 60 * 60 * 24,
    } as const;
}

export function tierlistQuery(patch?: string) {
    return {
        queryKey: ["lolalytics", "tierlist", patch],
        queryFn: async () => {
            return await getTierlistData(patch);
        },
        staleTime: 1000 * 60 * 60 * 24,
    } as const;
}
