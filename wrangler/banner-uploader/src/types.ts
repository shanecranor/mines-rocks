
export const SEASONS = ["fall", "spring", "summer"] as const;
export type Season = typeof SEASONS[number];

export function isSeason(variable: any): variable is Season {
    return SEASONS.includes(variable);
}

export interface Term {
    code: string;
    description: string;
}