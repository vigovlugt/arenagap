import { spawnSync } from "child_process";
import { ChampSelect } from "./champ-select";

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
        throw new Error("Could not find port or password of LCU.");
    }

    return {
        port: parseInt(portMatch[1]),
        password: passwordMatch[1],
        username: "riot",
    };
}

export async function fetchChampSelect(info: ClientInfo): Promise<
    | {
          errorCode: "RPC_ERROR";
          httpStatus: 404;
          implementationDetails: {};
          message: "No active delegate";
      }
    | ChampSelect
> {
    return fetchLcu(info, "lol-champ-select/v1/session");
}

export async function fetchLcu(info: ClientInfo, path: string) {
    const url = `https://127.0.0.1:${info.port}/${path}`;

    let errors = 0;
    while (true) {
        try {
            const temp = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            const res = await fetch(url, {
                headers: {
                    Authorization: `Basic ${Buffer.from(
                        `${info.username}:${info.password}`
                    ).toString("base64")}`,
                },
            });
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = temp;

            const json = await res.json();
            return json;
        } catch (e) {
            if (errors >= 10) {
                throw e;
            }

            errors++;
            await new Promise((r) => setTimeout(r, 500));
        }
    }
}
