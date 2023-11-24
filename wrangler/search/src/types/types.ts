import { Database } from './supabase';

export const SEASONS = ['fall', 'spring', 'summer'] as const;
export type Season = (typeof SEASONS)[number];

export function isSeason(variable: any): variable is Season {
	return SEASONS.includes(variable);
}

export type Course = Database['public']['Tables']['course_summary_data']['Row'];
export type BannerCourse = Database['public']['Tables']['banner_course_data']['Row'];
// export type Faculty = //TODO: figure out the type for faculty here
export type Assignment = Database['public']['Tables']['assignment_data']['Row'] & {
	score_statistics: { [key: string]: number };
};
export type AssignmentGroup = Database['public']['Tables']['assignment_group_data']['Row'];
export type GradeStatistics = {
	max: number;
	min: number;
	mean: number;
	median: number;
	upper_q: number;
	lower_q: number;
};
export const STAT_KEYS: ('max' | 'min' | 'mean' | 'median' | 'upper_q' | 'lower_q')[] = [
	'max',
	'min',
	'mean',
	'median',
	'upper_q',
	'lower_q',
];
