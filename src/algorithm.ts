import { LolalyticsData, LolalyticsTierlistData } from "./lolalytics-data";
import { ratingToWinrate, winrateToRating } from "./rating";

export function getSynergyMap(data: LolalyticsData): Record<number, number> {
    const map: Record<number, number> = {};

    for (const [champion, winrate] of data.team.middle) {
        map[champion] = winrateToRating(winrate);
    }

    return map;
}

export function getMatchupMap(data: LolalyticsData): Record<number, number> {
    const map: Record<number, number> = {};

    for (const [champion, winrate] of data.enemy.middle) {
        map[champion] = winrateToRating(winrate);
    }

    return map;
}

export type AnalysisResult = {
    championRating: number;
    synergyRating: number;
    totalMatchupRating: number;
    matchupRatingPerEnemy: Record<number, number>;
    totalRating: number;
};

function getRating(
    winrate: number,
    games: number,
    expectedRating: number = 0
): number {
    const wins = winrate * games;
    const FAKE_GAMES = 500;
    const FAKE_WINS = FAKE_GAMES * ratingToWinrate(expectedRating);

    const nudgedWinrate = (wins + FAKE_WINS) / (games + FAKE_GAMES);

    return winrateToRating(nudgedWinrate);
}

export function getAnalysisResult(
    dataByChampion: Record<string, LolalyticsData>,
    tierlistData: LolalyticsTierlistData,
    ally: number,
    enemies: number[],
    champion: number
): AnalysisResult {
    const allyData = dataByChampion[ally];
    const championData = dataByChampion[champion];

    const allyRating = getRating(allyData.header.wr, allyData.header.n);
    const currentChampionRating = getRating(
        tierlistData.cid[champion].wr,
        tierlistData.cid[champion].games
    );
    const championRating = getRating(
        championData.header.wr,
        championData.header.n
    );
    const expectedDuoRating = championRating + allyRating;
    const [_id, allySynergyWr, _d1, _d2, _pr, allySynergyGames] =
        allyData.team.middle.find(([c]) => c === champion)!;
    const allySynergyRating = getRating(
        allySynergyWr,
        allySynergyGames,
        expectedDuoRating
    );

    const duoRating = allySynergyRating - expectedDuoRating;

    const matchupMap: Record<string, number> = {};
    for (const enemy of enemies) {
        const expectedRating = championRating;

        const [_id, matchupWr, _d1, _d2, _pr, matchupGames] =
            championData.enemy.middle.find(([c]) => c === Number(enemy))!;
        const enemyMatchupRating = getRating(
            matchupWr,
            matchupGames,
            expectedRating
        );

        const matchupRating = enemyMatchupRating - expectedRating;

        matchupMap[enemy] = matchupRating;
    }

    const totalMatchupRating = enemies.reduce(
        (acc, val) => acc + matchupMap[val],
        0
    );

    return {
        championRating: currentChampionRating,
        synergyRating: duoRating,
        totalMatchupRating,
        matchupRatingPerEnemy: matchupMap,
        totalRating: duoRating + totalMatchupRating + currentChampionRating,
    };
}

export function getAllAnalysisResults(
    dataByChampion: Record<string, LolalyticsData>,
    tierlistData: LolalyticsTierlistData,
    ally: number,
    enemies: number[],
    bans: number[]
): Record<string, AnalysisResult> {
    return Object.fromEntries(
        Object.keys(dataByChampion)
            .map(Number)
            .filter(
                (c) => c != ally && !enemies.includes(c) && !bans.includes(c)
            )
            .map(
                (c) =>
                    [
                        c,
                        getAnalysisResult(
                            dataByChampion,
                            tierlistData,
                            ally,
                            enemies,
                            c
                        ),
                    ] as const
            )
    );
}
