import { c } from "vitest/dist/reporters-5f784f42";
import { RouteInfo } from "./types";

export function cleanAndFilterData(data: any, table_keys: any, routeInfo: RouteInfo) {
    return data.map((row: any) => {
        console.log("ROW")
        console.log(JSON.stringify(row))
        console.log("TABLE KEYS")
        console.log(JSON.stringify(table_keys))
        console.log("CLEAN ROW")
        console.log(cleanRow(row, table_keys))
        return cleanRow(row, table_keys)
    })
        .filter((row: any) => filterData(row, routeInfo));
}
export function filterData(row: any[], routeInfo: RouteInfo,) {
    // Filter out rows that don't have the required keys
    return routeInfo.requiredKeys?.every((key: any) => row[key] != null) ?? true;
}

/**
 * Cleans a row object. The resulting row contains every single key in the table keys and no other keys.
 *
 * @param {Object} row - Database row object with keys for each column.
 * @param {string[]} tableKeys - List of table column names.
 * @returns {Object} The modified row object containing only the keys present in tableKeys, setting missing keys to null.
 */
export function cleanRow(row: any, tableKeys: any[]) {
    const cleanedRow: any = {};
    const tableKeysSet = new Set(tableKeys);
    // for each key in the table keys, set the cleaned row's key to the row's key if it exists
    // otherwise set the cleaned row's key to null
    for (const key of tableKeys) {
        cleanedRow[key] = row[key] ?? null;
    }

    return cleanedRow;
}
