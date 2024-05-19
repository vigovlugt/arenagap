import { AnalysisResult } from "./algorithm";
import { ratingToWinrate } from "./rating";

function formatRating(rating: number) {
    const winrate = ratingToWinrate(rating);
    return parseFloat((winrate * 100).toFixed(2));
}

export function visualize({
    analysisResults,
    ddragonData,
    ally,
    bans,
    enemies,
}: {
    analysisResults: Record<string, AnalysisResult>;
    ddragonData: Record<string, { name: string; key: string }>;
    ally: number;
    bans: number[];
    enemies: number[];
}) {
    const sorted = Object.entries(analysisResults).sort(
        ([, a], [, b]) => b.totalRating - a.totalRating
    );

    const nameByKey = Object.fromEntries(
        Object.entries(ddragonData).map(([key, value]) => [
            Number(value.key),
            value.name,
        ])
    );

    console.log("Ally:", nameByKey[ally]);
    console.log("Enemies:", enemies.map((e) => nameByKey[e]).join(", "));
    console.log("Bans:", bans.map((b) => nameByKey[b]).join(", "));

    console.log("Advanced results:");
    console.table(
        sorted
            .map(([champion, result]) => ({
                Champion: nameByKey[champion],
                "Total Winrate": formatRating(result.totalRating),
                Base: formatRating(result.championRating),
                Synergy: formatRating(result.synergyRating),
                "Matchups:": formatRating(result.totalMatchupRating),
                ...Object.fromEntries(
                    Object.entries(result.matchupRatingPerEnemy).map(
                        ([key, value]) => [
                            nameByKey[Number(key)].slice(0, 7),
                            formatRating(value),
                        ]
                    )
                ),
            }))
            .slice(0, 30)
    );
    console.log("\nResults:");
    console.table(
        sorted
            .map(([champion, result]) => ({
                Champion: nameByKey[champion],
                "Total Winrate": formatRating(result.totalRating),
                Base: formatRating(result.championRating),
                Synergy: formatRating(result.synergyRating),
                Matchup: formatRating(result.totalMatchupRating),
            }))
            .slice(0, 30)
    );
}
