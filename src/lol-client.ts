import { spawnSync } from "child_process";

const portRegex = /--app-port=([0-9]+)/;
const passwordRegex = /--remoting-auth-token=([a-zA-Z0-9_-]+)/;

export type ClientInfo = {
    port: number;
    password: string;
    username: string;
};

export function getClientInfo(): ClientInfo {
    const result = spawnSync(
        "powershell.exe",
        `Get-CimInstance -Query "SELECT * from Win32_Process WHERE name LIKE 'LeagueClientUx.exe'" | Select-Object -ExpandProperty CommandLine`.split(
            " "
        ),
        { encoding: "utf-8" }
    );

    const stdout = result.stdout;

    const portMatch = portRegex.exec(stdout);
    const passwordMatch = passwordRegex.exec(stdout);

    if (!portMatch || !passwordMatch) {
        throw new Error("Could not find port or password");
    }

    return {
        port: parseInt(portMatch[1]),
        password: passwordMatch[1],
        username: "riot",
    };
}

export async function fetchLcu(info: ClientInfo, path: string) {
    const url = `http://127.0.0.1:${info.port}/${path}`;

    const res = await fetch(url, {
        headers: {
            Authorization: `Basic ${Buffer.from(
                `${info.username}:${info.password}`
            ).toString("base64")}`,
        },
    });

    const json = await res.json();
    return json;
}
