import { Box, Text, useInput } from "ink";
import { ratingToWinrate } from "../rating";
import { useSuspenseQuery } from "@tanstack/react-query";
import { championsQuery, versionsQuery } from "../queries";
import { useResultState } from "../state";
import Table from "./table";
import { useState } from "react";

function formatRating(rating: number) {
    const winrate = ratingToWinrate(rating);
    return parseFloat((winrate * 100).toFixed(2));
}

export function Results() {
    const state = useResultState();

    const { data: versions } = useSuspenseQuery(versionsQuery());
    const { data: ddragonData } = useSuspenseQuery(
        championsQuery(versions[0]!)
    );

    const { ally, bans, enemies, analysisResults } = state;

    const sorted = Object.entries(analysisResults).sort(
        ([, a], [, b]) => b.totalRating - a.totalRating
    );

    const nameByKey = Object.fromEntries(
        Object.entries(ddragonData).map(([, value]) => [
            Number(value.key),
            value.name,
        ])
    );

    // console.log("Ally:", nameByKey[ally]);
    // console.log("Enemies:", enemies.map((e) => nameByKey[e]).join(", "));
    // console.log("Bans:", bans.map((b) => nameByKey[b]).join(", "));

    const [champion, setChampion] = useState<null | number>(null);

    const [page, setPage] = useState(0);
    const start = page * 10;

    useInput((i, key) => {
        if (key.leftArrow) {
            setPage((p) => Math.max(0, p - 1));
        }

        if (key.rightArrow) {
            setPage((p) => Math.min(Math.floor(sorted.length / 10), p + 1));
        }

        const rank = parseInt(i);
        if (!isNaN(rank) && rank >= 0 && rank < 10) {
            setChampion(Number(sorted[rank - 1][0]));
        }

        if (key.backspace || key.delete) {
            setChampion(null);
        }
    });

    if (champion !== null) {
        const result = analysisResults[champion];
        return (
            <Box
                flexDirection="column"
                width="100%"
                justifyContent="center"
                alignItems="center"
            >
                <Table
                    data={[
                        {
                            Champion: "Total Winrate",
                            [nameByKey[champion]]: formatRating(
                                result.totalRating
                            ),
                        },
                        {
                            Champion: "Base",
                            [nameByKey[champion]]: formatRating(
                                result.championRating
                            ),
                        },
                        {
                            Champion: "Synergy",
                            [nameByKey[champion]]: formatRating(
                                result.synergyRating
                            ),
                        },
                        {
                            Champion: "Matchup",
                            [nameByKey[champion]]: formatRating(
                                result.totalMatchupRating
                            ),
                        },
                    ]}
                />
                <Table
                    data={Object.entries(result.matchupRatingPerEnemy).map(
                        ([e, rating]) => ({
                            Enemy: nameByKey[e],
                            Matchup: formatRating(rating),
                        })
                    )}
                />
                <Box>
                    <Text>Backspace to return</Text>
                </Box>
            </Box>
        );
    }

    return (
        <Box
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width="100%"
        >
            <Table
                data={[
                    {
                        Match: "Ally",
                        "  ": nameByKey[ally],
                    },
                    {
                        Match: "Enemies",
                        "  ": enemies.map((e) => nameByKey[e]).join(", "),
                    },
                    {
                        Match: "Bans",
                        "  ": bans.map((b) => nameByKey[b]).join(", "),
                    },
                ]}
                cell={({ column, children }) => (
                    <Text color={column === 0 ? "blue" : undefined}>
                        {children}
                    </Text>
                )}
            />
            <Table
                data={sorted
                    .map(([champion, result], i) => ({
                        Rank: i + 1,
                        Champion: nameByKey[champion],
                        "Total Winrate": formatRating(result.totalRating),
                        Base: formatRating(result.championRating),
                        Synergy: formatRating(result.synergyRating),
                        Matchup: formatRating(result.totalMatchupRating),
                    }))
                    .slice(start, start + 10)}
                cell={({ column, children }) => (
                    <Text color={column === 2 ? "green" : undefined}>
                        {children}
                    </Text>
                )}
            />
            <Box flexDirection="column">
                <Text>
                    Page {page + 1} of {Math.ceil(sorted.length / 10)} | ←/→ |{" "}
                    {"{Rank}"} to view champion details
                </Text>
            </Box>
        </Box>
    );
}
