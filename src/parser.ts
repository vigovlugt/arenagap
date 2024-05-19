import { LolalyticsData } from "./lolalytics-data";

type QObject = Record<string, any>;

type QContext = {
    contexts: Map<string, QObject>;
};

type QwikJsonObject = {
    ctx: Record<string, QContext>;
};

export function parseQType(data: any): any {
    switch (data.constructor.name) {
        case "Array_":
            return [...data].map((v) => parseQType(v));
        case "Object_":
            const { __id, __backRefs, ...rest } = data;
            return Object.fromEntries(
                Object.entries(rest).map(([key, value]) => [
                    key,
                    parseQType(value),
                ])
            );
        default:
            if (data.__value !== undefined) {
                return parseQType(data.__value);
            }
            return data;
    }
}

export function parseQwikJson(qwikJson: QwikJsonObject) {
    const dataObj = qwikJson.ctx["1"].contexts.get("qc-s")!["yf90I1s9hpQ"];

    return parseQType(dataObj);
}
