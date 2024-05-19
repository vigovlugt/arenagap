import { JSDOM } from "jsdom";
// @ts-expect-error
import { runQwikJsonDebug, qwikJsonDebug } from "./qwik-json";
import { parseQwikJson } from "./parser";
import { normalizeWr, normalizeWrTierlist } from "./normalize-wr";
import { createAsyncQueue } from "./async-queue";

export type LolalyticsData = {
    enemy: { middle: [number, number, number, number, number, number][] };
    team: { middle: [number, number, number, number, number, number][] };
    avgWr: number;
    header: {
        br: number;
        cid: number;
        n: number;
        place1: number;
        place2: number;
        place3: number;
        place4: number;
        place5: number;
        place6: number;
        place7: number;
        place8: number;
        pr: number;
        rank: number;
        rankTotal: number;
        tier: string;
        wr: number;
    };
};

export type LolalyticsTierlistData = {
    avgWr: number;
    cid: Record<
        string,
        {
            games: number;
            wr: number;
        }
    >;
};

const asyncQueue = createAsyncQueue(1);

const lolalyticsFetch = (url: string) => {
    return new Promise<Response>((resolve, reject) => {
        asyncQueue.push(async () => {
            try {
                const res = await fetch(url);
                resolve(res);
            } catch (e) {
                reject(e);
            }
        });
    });
};

export async function getData(
    championData: Record<string, { id: string; key: string }>,
    champion: number,
    patch?: string
) {
    let championId = Object.values(championData).find(
        (c) => Number(c.key) === champion
    )!.id;
    if (championId === "MonkeyKing") championId = "Wukong";

    const queryParams = new URLSearchParams();
    if (patch) queryParams.set("patch", patch.split(".").slice(0, 2).join("."));

    const url = `https://lolalytics.com/lol/${championId.toLowerCase()}/arena/build/?${queryParams.toString()}`;
    const res = await lolalyticsFetch(url);
    const html = await res.text();

    const dom = new JSDOM(html);
    const window = dom.window;
    const document = dom.window.document;

    runQwikJsonDebug(window, document, qwikJsonDebug);
    const { qwikJson } = window;

    const data = parseQwikJson(qwikJson) as LolalyticsData;
    normalizeWr(data);

    return data;
}

export async function getTierlistData(patch?: string) {
    const queryParams = new URLSearchParams();
    if (patch) queryParams.set("patch", patch.split(".").slice(0, 2).join("."));

    const url = `https://lolalytics.com/lol/tierlist/arena/?${queryParams.toString()}`;
    const res = await lolalyticsFetch(url);
    const html = await res.text();

    const dom = new JSDOM(html);
    const window = dom.window;
    const document = dom.window.document;

    runQwikJsonDebug(window, document, qwikJsonDebug);
    const { qwikJson } = window;

    const data = parseQwikJson(qwikJson) as LolalyticsTierlistData;
    normalizeWrTierlist(data);

    return data;
}
