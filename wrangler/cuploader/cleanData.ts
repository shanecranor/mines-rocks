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
 * 
 * @param row database row object with keys for each column
 * @param table_keys list of table column names
 * @returns items in the row that match the table columns and have a value
 */
export function cleanRow(row: any, table_keys: any[]) {
    const table_keys_set = new Set(table_keys);
    for (const key of table_keys) {
        row[key] = row[key] ?? null;
    }

    for (const key in row) {
        if (!table_keys_set.has(key)) delete row[key];
    }
    return row;
}
