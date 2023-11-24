export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			assignment_data: {
				Row: {
					allowed_attempts: number | null;
					allowed_extensions: Json | null;
					assignment_group_id: number | null;
					course_id: number | null;
					created_at: string | null;
					description: string | null;
					due_at: string | null;
					final_grader_id: number | null;
					grading_standard_id: number | null;
					grading_type: string | null;
					id: number;
					name: string | null;
					omit_from_final_grade: boolean | null;
					peer_review_count: number | null;
					peer_reviews: boolean | null;
					points_possible: number | null;
					require_lockdown_browser: boolean | null;
					score_statistics: Json | null;
					turnitin_enabled: boolean | null;
					turnitin_settings: string | null;
					unlock_at: string | null;
					updated_at: string | null;
					vericite_enabled: boolean | null;
				};
				Insert: {
					allowed_attempts?: number | null;
					allowed_extensions?: Json | null;
					assignment_group_id?: number | null;
					course_id?: number | null;
					created_at?: string | null;
					description?: string | null;
					due_at?: string | null;
					final_grader_id?: number | null;
					grading_standard_id?: number | null;
					grading_type?: string | null;
					id?: number;
					name?: string | null;
					omit_from_final_grade?: boolean | null;
					peer_review_count?: number | null;
					peer_reviews?: boolean | null;
					points_possible?: number | null;
					require_lockdown_browser?: boolean | null;
					score_statistics?: Json | null;
					turnitin_enabled?: boolean | null;
					turnitin_settings?: string | null;
					unlock_at?: string | null;
					updated_at?: string | null;
					vericite_enabled?: boolean | null;
				};
				Update: {
					allowed_attempts?: number | null;
					allowed_extensions?: Json | null;
					assignment_group_id?: number | null;
					course_id?: number | null;
					created_at?: string | null;
					description?: string | null;
					due_at?: string | null;
					final_grader_id?: number | null;
					grading_standard_id?: number | null;
					grading_type?: string | null;
					id?: number;
					name?: string | null;
					omit_from_final_grade?: boolean | null;
					peer_review_count?: number | null;
					peer_reviews?: boolean | null;
					points_possible?: number | null;
					require_lockdown_browser?: boolean | null;
					score_statistics?: Json | null;
					turnitin_enabled?: boolean | null;
					turnitin_settings?: string | null;
					unlock_at?: string | null;
					updated_at?: string | null;
					vericite_enabled?: boolean | null;
				};
				Relationships: [
					{
						foreignKeyName: 'assignment_data_assignment_group_id_fkey';
						columns: ['assignment_group_id'];
						isOneToOne: false;
						referencedRelation: 'assignment_group_data';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'assignment_data_course_id_fkey';
						columns: ['course_id'];
						isOneToOne: false;
						referencedRelation: 'course_summary_data';
						referencedColumns: ['id'];
					}
				];
			};
			assignment_group_data: {
				Row: {
					group_weight: number | null;
					id: number;
					name: string | null;
					position: number | null;
					rules: Json | null;
				};
				Insert: {
					group_weight?: number | null;
					id: number;
					name?: string | null;
					position?: number | null;
					rules?: Json | null;
				};
				Update: {
					group_weight?: number | null;
					id?: number;
					name?: string | null;
					position?: number | null;
					rules?: Json | null;
				};
				Relationships: [];
			};
			banner_course_data: {
				Row: {
					campusDescription: string | null;
					course_id: number | null;
					courseNumber: number | null;
					courseTitle: string | null;
					creditHourHigh: number | null;
					creditHourIndicator: string | null;
					creditHourLow: number | null;
					creditHours: number | null;
					enrollment: number | null;
					faculty: Json | null;
					id: number;
					instructionalMethod: string | null;
					instructionalMethodDescription: string | null;
					maximumEnrollment: number | null;
					meetingsFaculty: Json | null;
					partOfTerm: string | null;
					scheduleTypeDescription: string | null;
					searchInput: string | null;
					seatsAvailable: number | null;
					sequenceNumber: string | null;
					subject: string | null;
					subjectCourse: string | null;
					subjectDescription: string | null;
					term: number | null;
					termDesc: string | null;
					waitCapacity: number | null;
					waitCount: number | null;
				};
				Insert: {
					campusDescription?: string | null;
					course_id?: number | null;
					courseNumber?: number | null;
					courseTitle?: string | null;
					creditHourHigh?: number | null;
					creditHourIndicator?: string | null;
					creditHourLow?: number | null;
					creditHours?: number | null;
					enrollment?: number | null;
					faculty?: Json | null;
					id?: number;
					instructionalMethod?: string | null;
					instructionalMethodDescription?: string | null;
					maximumEnrollment?: number | null;
					meetingsFaculty?: Json | null;
					partOfTerm?: string | null;
					scheduleTypeDescription?: string | null;
					searchInput?: string | null;
					seatsAvailable?: number | null;
					sequenceNumber?: string | null;
					subject?: string | null;
					subjectCourse?: string | null;
					subjectDescription?: string | null;
					term?: number | null;
					termDesc?: string | null;
					waitCapacity?: number | null;
					waitCount?: number | null;
				};
				Update: {
					campusDescription?: string | null;
					course_id?: number | null;
					courseNumber?: number | null;
					courseTitle?: string | null;
					creditHourHigh?: number | null;
					creditHourIndicator?: string | null;
					creditHourLow?: number | null;
					creditHours?: number | null;
					enrollment?: number | null;
					faculty?: Json | null;
					id?: number;
					instructionalMethod?: string | null;
					instructionalMethodDescription?: string | null;
					maximumEnrollment?: number | null;
					meetingsFaculty?: Json | null;
					partOfTerm?: string | null;
					scheduleTypeDescription?: string | null;
					searchInput?: string | null;
					seatsAvailable?: number | null;
					sequenceNumber?: string | null;
					subject?: string | null;
					subjectCourse?: string | null;
					subjectDescription?: string | null;
					term?: number | null;
					termDesc?: string | null;
					waitCapacity?: number | null;
					waitCount?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: 'banner_course_data_course_id_fkey';
						columns: ['course_id'];
						isOneToOne: false;
						referencedRelation: 'course_summary_data';
						referencedColumns: ['id'];
					}
				];
			};
			course_summary_data: {
				Row: {
					apply_assignment_group_weights: boolean | null;
					course_code: string | null;
					created_at: string | null;
					end_at: string | null;
					friendly_name: string | null;
					grading_standard_id: number | null;
					id: number;
					name: string | null;
					start_at: string | null;
					time_zone: string | null;
					upload_date: string | null;
				};
				Insert: {
					apply_assignment_group_weights?: boolean | null;
					course_code?: string | null;
					created_at?: string | null;
					end_at?: string | null;
					friendly_name?: string | null;
					grading_standard_id?: number | null;
					id: number;
					name?: string | null;
					start_at?: string | null;
					time_zone?: string | null;
					upload_date?: string | null;
				};
				Update: {
					apply_assignment_group_weights?: boolean | null;
					course_code?: string | null;
					created_at?: string | null;
					end_at?: string | null;
					friendly_name?: string | null;
					grading_standard_id?: number | null;
					id?: number;
					name?: string | null;
					start_at?: string | null;
					time_zone?: string | null;
					upload_date?: string | null;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			hello_world: {
				Args: Record<PropertyKey, never>;
				Returns: string;
			};
			list_columns: {
				Args: {
					table_id: string;
				};
				Returns: string[];
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
}
