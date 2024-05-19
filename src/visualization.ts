import { AnalysisResult } from "./algorithm";
import { ratingToWinrate } from "./rating";

function formatRating(rating: number) {
    const winrate = ratingToWinrate(rating);
    return parseFloat((winrate * 100).toFixed(2));
}

export function visualize({
    analysisResults,
    ddragonData,
}: {
    analysisResults: Record<string, AnalysisResult>;
    ddragonData: Record<string, { name: string; key: string }>;
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

    console.table(
        sorted
            .map(([champion, result]) => ({
                champion: nameByKey[champion],
                winrate: formatRating(result.totalRating),
                synergy: formatRating(result.synergyRating),
                matchup: formatRating(result.totalMatchupRating),
            }))
            .slice(0, 30)
    );
}
