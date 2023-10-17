interface Row {
    [key: string]: unknown;
}

/**
 * Cleans and filters data from a table based on the route info and table keys
 * @param {Row[]} data - Table data
 * @param {string[]} tableKeys - List of keys that exist in the table
 * @param {string[]} requiredKeys - Information about the route that defines filtering conditions
 * @returns {Row[]} Cleaned and filtered data
 */
export function cleanAndFilterData(data: Row[], tableKeys: string[], requiredKeys?: string[]): Row[] {
    return data.map(row => cleanRow(row, tableKeys))
        .filter(row => hasRequiredKeys(row, requiredKeys));
}

/**
 * Checks if a row object has all the required keys.
 * @param {Row} row - Database row object with keys for each column.
 * @param {string[]} requiredKeys
 * @returns {boolean} 
 */
export function hasRequiredKeys(row: Row, requiredKeys?: string[]): boolean {
    return requiredKeys?.every(key => row[key] != null) ?? true;
}

/**
 * Cleans a row object. The resulting row contains every single key in the table keys and no other keys.
 *
 * @param {Row} row - Database row object with keys for each column.
 * @param {string[]} tableKeys - List of table column names.
 * @returns {Row} The modified row object containing only the keys present in tableKeys, setting missing keys to null.
 */
export function cleanRow(row: Row, tableKeys: string[]): Row {
    const cleanedRow: Row = {};
    // for each key in the table keys, set the cleaned row's key to the row's key 
    // if the tableKey doesn't exist set the cleaned row's key to null
    for (const key of tableKeys) {
        cleanedRow[key] = row[key] ?? null;
    }
    return cleanedRow;
}
