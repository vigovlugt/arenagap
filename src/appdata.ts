import { homedir } from "os";
import { join } from "path";

export function getAppDataPath() {
    return join(homedir(), "AppData", "Roaming");
}
