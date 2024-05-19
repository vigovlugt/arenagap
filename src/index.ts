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
import { fetchChampSelect, getClientInfo } from "./lol-client";
import { ChampSelect, getAlly, getBans, getEnemies } from "./champ-select";

async function getMatchInfo() {
    console.log("Connecting to client...");
    let info = null;
    while (true) {
        try {
            info = getClientInfo();
            console.log("Connected to client.");
            break;
        } catch (e) {
            console.log("Could not connect to client. Retrying...");
            await new Promise((r) => setTimeout(r, 2000));
        }
    }

    console.log("Fetching champ select...");
    let i = 0;
    let j = 0;
    while (true) {
        let response = await fetchChampSelect(info);
        if ("httpStatus" in response && response.httpStatus === 404) {
            if (i % 20 === 0) {
                console.log("Waiting for champ select to start...");
            }
            await new Promise((r) => setTimeout(r, 500));
            i++;
            continue;
        }

        const champSelect = response as ChampSelect;

        const enemies = getEnemies(champSelect);
        const ally = getAlly(champSelect);
        const bans = getBans(champSelect);
        if (enemies.length === 0 || ally === undefined) {
            if (j % 20 === 0) {
                console.log("Waiting for enemies or ally to pick...");
            }
            await new Promise((r) => setTimeout(r, 500));
            j++;
            continue;
        }

        console.log("Champ select fetched.");

        return {
            ally,
            bans,
            enemies,
        };
    }
}

async function run() {
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
    console.log("Data loaded.");

    // Perform analysis
    // const { enemies, ally, bans } = {
    //     enemies: [1, 3, 4, 5, 6, 7, 8, 9],
    //     ally: 420,
    //     bans: [2],
    // };
    const { enemies, ally, bans } = await getMatchInfo();

    const analysisResults = getAllAnalysisResults(
        dataByChampion,
        tierlist,
        ally,
        enemies,
        bans
    );

    // Visualize results
    console.log("\n\n");
    visualize({ analysisResults, ddragonData, ally, bans, enemies });
    process.exit();
}

run();

// https://github.com/nexe/nexe
