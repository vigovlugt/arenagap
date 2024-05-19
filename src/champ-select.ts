export interface ChampSelect {
    actions: Action[][];
    allowBattleBoost: boolean;
    allowDuplicatePicks: boolean;
    allowLockedEvents: boolean;
    allowRerolling: boolean;
    allowSkinSelection: boolean;
    bans: Bans;
    benchChampions: any[];
    benchEnabled: boolean;
    boostableSkinCount: number;
    chatDetails: ChatDetails;
    counter: number;
    gameId: number;
    hasSimultaneousBans: boolean;
    hasSimultaneousPicks: boolean;
    isCustomGame: boolean;
    isSpectating: boolean;
    localPlayerCellId: number;
    lockedEventIndex: number;
    myTeam: MyTeam[];
    pickOrderSwaps: PickOrderSwap[];
    recoveryCounter: number;
    rerollsRemaining: number;
    skipChampionSelect: boolean;
    theirTeam: any[];
    timer: Timer;
    trades: any[];
}

export interface Action {
    actorCellId: number;
    championId: number;
    completed: boolean;
    id: number;
    isAllyAction: boolean;
    isInProgress: boolean;
    type: string;
}

export interface Bans {
    myTeamBans: any[];
    numBans: number;
    theirTeamBans: any[];
}

export interface ChatDetails {
    mucJwtDto: MucJwtDto;
    multiUserChatId: string;
    multiUserChatPassword: string;
}

export interface MucJwtDto {
    channelClaim: string;
    domain: string;
    jwt: string;
    targetRegion: string;
}

export interface MyTeam {
    assignedPosition: string;
    cellId: number;
    championId: number;
    championPickIntent: number;
    nameVisibilityType: string;
    obfuscatedPuuid: string;
    obfuscatedSummonerId: number;
    puuid: string;
    selectedSkinId: number;
    spell1Id: number;
    spell2Id: number;
    summonerId: number;
    team: number;
    wardSkinId: number;
}

export interface PickOrderSwap {
    cellId: number;
    id: number;
    state: string;
}

export interface Timer {
    adjustedTimeLeftInPhase: number;
    internalNowInEpochMs: number;
    isInfinite: boolean;
    phase: string;
    totalTimeInPhase: number;
}

export function getBans(champSelect: ChampSelect) {
    const bans = champSelect.actions
        .flat()
        .filter((a) => a.type === "ban")
        .map((a) => a.championId);

    return bans;
}

export function getAlly(c: ChampSelect): number | undefined {
    return c.myTeam.find((t) => t.championId !== 0)?.championId;
}

export function getEnemies(champSelect: ChampSelect) {
    const ally = getAlly(champSelect);
    return champSelect.actions
        .flat()
        .filter((a) => a.type === "pick")
        .map((a) => a.championId)
        .filter((a) => a !== 0 && a !== ally);
}
