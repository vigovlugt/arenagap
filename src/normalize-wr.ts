import { LolalyticsData, LolalyticsTierlistData } from "./lolalytics-data";
import { ratingToWinrate, winrateToRating } from "./rating";

function normalize(wr: number, baseWr: number) {
    const baseRating = winrateToRating(baseWr);
    const rating = winrateToRating(wr);

    return ratingToWinrate(rating - baseRating);
}

export function normalizeWr(data: LolalyticsData) {
    data.avgWr /= 100;
    data.header.wr /= 100;

    data.header.wr = normalize(data.header.wr, data.avgWr);

    for (const team of data.team.middle) {
        team[1] /= 100;
        team[1] = normalize(team[1], data.avgWr);
    }

    for (const enemy of data.enemy.middle) {
        enemy[1] /= 100;
        enemy[1] = normalize(enemy[1], data.avgWr);
    }
}

export function normalizeWrTierlist(data: LolalyticsTierlistData) {
    data.avgWr /= 100;

    for (const c of Object.values(data.cid)) {
        c.wr /= 100;
        c.wr = normalize(c.wr, data.avgWr);
    }
}
