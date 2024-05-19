import { getAllAnalysisResults } from "./algorithm";
import { queryClient, restoreClient, saveClient } from "./query-client";
import {
    championQuery,
    championsQuery,
    tierlistQuery,
    versionsQuery,
} from "./queries";
import process from "node:process";
import { visualize } from "./visualization";
import { fetchLcu, getClientInfo } from "./lol-client";

async function run() {
    const info = getClientInfo();
    console.log(info);
    const response = await fetchLcu(info, "lol-champ-select/v1/session");
    console.log(response);

    return;
    await restoreClient();
    console.log("Loading data...");
    const versions = await queryClient.fetchQuery(versionsQuery());
    const ddragonData = await queryClient.fetchQuery(
        championsQuery(versions[0])
    );
    const largeVersion = versions[1];

    const dataByChampionPromise = Promise.all(
        Object.values(ddragonData).map(
            async (c) =>
                [
                    c.key,
                    await queryClient.fetchQuery(
                        championQuery(Number(c.key), largeVersion)
                    ),
                ] as const
        )
    ).then((arr) => Object.fromEntries(arr));
    const tierlistPromise = queryClient.fetchQuery(tierlistQuery());

    const [dataByChampion, tierlist] = await Promise.all([
        dataByChampionPromise,
        tierlistPromise,
    ]);

    await saveClient();

    // Perform analysis
    const enemies = [238, 1];
    const ally = 555;

    const analysisResults = getAllAnalysisResults(
        dataByChampion,
        tierlist,
        ally,
        enemies
    );

    // Visualize results
    visualize({ analysisResults, ddragonData });
    process.exit();
}

run();

// https://github.com/nexe/nexe
