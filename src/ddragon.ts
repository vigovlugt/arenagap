export async function getVersions() {
    const res = await fetch(
        "https://ddragon.leagueoflegends.com/api/versions.json"
    );
    const versions = await res.json();
    return versions as string[];
}

export async function getChampions(version: string) {
    const res = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
    );

    const { data } = await res.json();

    return data as Record<string, { key: string; name: string; id: string }>;
}
