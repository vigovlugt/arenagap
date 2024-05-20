import { getAllAnalysisResults } from "./algorithm";
import { queryClient, restoreClient, saveClient } from "./query-client";
import {
    championQuery,
    championsQuery,
    tierlistQuery,
    versionsQuery,
} from "./queries";
import process from "node:process";
import { fetchChampSelect, getClientInfo } from "./lol-client";
import { ChampSelect, getAlly, getBans, getEnemies } from "./champ-select";
import { withFullScreen } from "fullscreen-ink";
import { App } from "./ui/app";
import { appStateStore } from "./state";

async function getMatchInfo() {
    appStateStore.setState({
        type: "loading",
        text: "Connecting to client...",
    });
    let info = null;
    while (true) {
        try {
            info = getClientInfo();
            break;
        } catch (e) {
            await new Promise((r) => setTimeout(r, 2000));
        }
    }

    appStateStore.setState({
        type: "loading",
        text: "Loading champ select data...",
    });
    while (true) {
        let response = await fetchChampSelect(info);
        if ("httpStatus" in response && response.httpStatus === 404) {
            appStateStore.setState({
                type: "loading",
                text: "Waiting for champ select to start...",
            });

            await new Promise((r) => setTimeout(r, 500));
            continue;
        }

        const champSelect = response as ChampSelect;

        const enemies = getEnemies(champSelect);
        const ally = getAlly(champSelect);
        const bans = getBans(champSelect);
        if (enemies.length === 0 || ally === undefined) {
            appStateStore.setState({
                type: "loading",
                text: "Waiting for picks to be revealed...",
            });
            await new Promise((r) => setTimeout(r, 500));
            continue;
        }

        return {
            ally,
            bans,
            enemies,
        };
    }
}

async function run() {
    appStateStore.setState({
        type: "loading",
        text: "Loading lolalytics data...",
    });
    await restoreClient();
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

    appStateStore.setState({
        type: "result",
        ally,
        bans,
        enemies,
        analysisResults,
    });
}

async function runUI() {
    const i = withFullScreen(<App />);
    await i.start();
    await i.waitUntilExit();
}

async function main() {
    run();
    await runUI();
    process.exit();
}

main();
