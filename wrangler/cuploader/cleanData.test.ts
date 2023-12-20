import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { Row, cleanRow } from '../shared-util/cleanData';
import { mergeData } from '.';
const courseTableKeys = [
  'grading_standard_id',
  'created_at',
  'end_at',
  'apply_assignment_group_weights',
  'id',
  'start_at',
  'name',
  'time_zone',
  'friendly_name',
  'course_code',
];

const assignmentTableKeys = [
  'id',
  'course_id',
  'name',
  'description',
  'assignment_group_id',
  'allowed_extensions',
  'turnitin_enabled',
  'vericite_enabled',
  'turnitin_settings',
  'peer_reviews',
  'peer_review_count',
  'points_possible',
  'grading_type',
  'grading_standard_id',
  'omit_from_final_grade',
  'final_grader_id',
  'allowed_attempts',
  'score_statistics',
  'require_lockdown_browser',
  'created_at',
  'due_at',
  'unlock_at',
  'updated_at',
];
const testAssignmentRow = {
  id: 173469,
  course_id: 26970,
  name: 'Exam 3 Free Response Upload and Grade',
  description:
    '<link rel="stylesheet" href="https://instructure-uploads.s3.amazonaws.com/account_98020000000000001/attachments/1949977/canvas_global_app.css"><p>Upload your Exam 3 Free Response work here.</p><script src="https://instructure-uploads.s3.amazonaws.com/account_98020000000000001/attachments/1949976/canvas_global_app.js"></script>',
  assignment_group_id: 38962,
  allowed_extensions: ['pdf'],
  turnitin_enabled: null,
  vericite_enabled: null,
  turnitin_settings: null,
  peer_reviews: false,
  peer_review_count: null,
  points_possible: 25,
  grading_type: 'points',
  grading_standard_id: null,
  omit_from_final_grade: false,
  final_grader_id: null,
  allowed_attempts: -1,
  score_statistics: {
    max: 25,
    min: 0,
    mean: 17,
    median: 19.5,
    lower_q: 13.5,
    upper_q: 23,
  },
  require_lockdown_browser: false,
  created_at: '2020-11-19T20:59:19+00:00',
  due_at: '2020-11-20T06:50:00+00:00',
  unlock_at: '2020-11-19T21:00:00+00:00',
  updated_at: '2020-12-03T22:38:05+00:00',
};
const testCourseRow = {
  id: 32674,
  name: 'WEB PROGRAMMING, Sec: A Fall 21',
  account_id: 393,
  uuid: '2AwCaOEw5VAs6zNReYtc4yT1J1jjyzB56CvS1HsY',
  start_at: '2021-08-23T07:01:00Z',
  grading_standard_id: 594,
  is_public: false,
  created_at: '2020-12-07T22:00:59Z',
  course_code: 'Fall.2021.CSCI445A',
  default_view: 'wiki',
  root_account_id: 1,
  enrollment_term_id: 159,
  license: 'private',
  grade_passback_setting: null,
  end_at: null,
  public_syllabus: false,
  public_syllabus_to_auth: false,
  storage_quota_mb: 5000,
  is_public_to_auth_users: false,
  homeroom_course: false,
  course_color: null,
  friendly_name: null,
  apply_assignment_group_weights: true,
  calendar: {
    ics: 'https://elearning.mines.edu/feeds/calendars/course_2AwCaOEw5VAs6zNReYtc4yT1J1jjyzB56CvS1HsY.ics',
  },
  time_zone: 'America/Denver',
  blueprint: false,
  template: false,
  enrollments: [
    {
      type: 'student',
      role: 'StudentEnrollment',
      role_id: 3,
      user_id: 16750,
      enrollment_state: 'active',
      limit_privileges_to_course_section: false,
    },
  ],
  hide_final_grades: false,
  workflow_state: 'available',
  restrict_enrollments_to_course_dates: false,
  overridden_course_visibility: '',
};

describe('cleanRow', () => {
  it('clean row contrived', () => {
    const cleanedRow = cleanRow(testCourseRow, courseTableKeys);
    validateRow(cleanedRow, courseTableKeys);
  });
  it('clean row contrived2', () => {
    const cleanedRow = cleanRow(testAssignmentRow, assignmentTableKeys);
    validateRow(cleanedRow, assignmentTableKeys);
  });
  it('clean row empty assignment', () => {
    const cleanedRow = cleanRow({}, assignmentTableKeys);
    //check that the clean row contains every single key in the table keys and no other keys
    validateRow(cleanedRow, assignmentTableKeys);
  });
  it('testing merge same rows', () => {
    const mergedRow = mergeData(
      [testAssignmentRow],
      [testAssignmentRow],
      assignmentTableKeys,
    );
    validateRow(mergedRow[0], assignmentTableKeys);
    //check that the merged row is the same as the original row
    expect(mergedRow[0]).toEqual(testAssignmentRow);
  });
  it('testing merge with different data', () => {
    const mergedRow = mergeData(
      [testAssignmentRow],
      [{ ...testAssignmentRow, name: 'different name' }],
      assignmentTableKeys,
    );
    validateRow(mergedRow[0], assignmentTableKeys);
    //check that the merged row is the same as the original row
    expect(mergedRow[0]).toEqual(testAssignmentRow);

    const mergedRow2 = mergeData(
      [{ ...testAssignmentRow, name: 'different name' }],
      [testAssignmentRow],
      assignmentTableKeys,
    );
    validateRow(mergedRow2[0], assignmentTableKeys);
    //check that the merged row is the equal to the new row
    expect(mergedRow2[0]).toEqual({
      ...testAssignmentRow,
      name: 'different name',
    });
  });
  //testing overwriting with null
  it('testing merge with null', () => {
    const mergedRow = mergeData(
      [testAssignmentRow],
      [{ ...testAssignmentRow, name: null }],
      assignmentTableKeys,
    );
    validateRow(mergedRow[0], assignmentTableKeys);
    //check that the merged row is the same as the original row
    expect(mergedRow[0]).toEqual(testAssignmentRow);

    const mergedRow2 = mergeData(
      [{ ...testAssignmentRow, name: null }],
      [testAssignmentRow],
      assignmentTableKeys,
    );
    validateRow(mergedRow2[0], assignmentTableKeys);
    //check that the merged row is the equal to the new row
    expect(mergedRow2[0]).toEqual(testAssignmentRow);
  });
  it('testing merge with null score_statistics', () => {
    const mergedRow = mergeData(
      [testAssignmentRow],
      [{ ...testAssignmentRow, score_statistics: null }],
      assignmentTableKeys,
    );
    validateRow(mergedRow[0], assignmentTableKeys);
    //check that the merged row is the same as the original row
    expect(mergedRow[0]).toEqual(testAssignmentRow);

    const mergedRow2 = mergeData(
      [{ ...testAssignmentRow, score_statistics: null }],
      [testAssignmentRow],
      assignmentTableKeys,
    );
    validateRow(mergedRow2[0], assignmentTableKeys);
    //check that the merged row is the equal to the new row
    expect(mergedRow2[0]).toEqual(testAssignmentRow);
  });
  //test with updated score statistics
  it('testing merge with updated score_statistics', () => {
    const mergedRow = mergeData(
      [testAssignmentRow],
      [
        {
          ...testAssignmentRow,
          score_statistics: {
            max: 25,
            min: 0,
            mean: 23,
            median: 24,
            lower_q: 21,
            upper_q: 29,
          },
        },
      ],
      assignmentTableKeys,
    );
    validateRow(mergedRow[0], assignmentTableKeys);
    //check that the merged row is the same as the original row
    expect(mergedRow[0]).toEqual(testAssignmentRow);

    const mergedRow2 = mergeData(
      [
        {
          ...testAssignmentRow,
          score_statistics: {
            max: 25,
            min: 0,
            mean: 23,
            median: 24,
            lower_q: 21,
            upper_q: 29,
          },
        },
      ],
      [testAssignmentRow],
      assignmentTableKeys,
    );
    validateRow(mergedRow2[0], assignmentTableKeys);
    //check that the merged row is the equal to the new row
    expect(mergedRow2[0]).toEqual({
      ...testAssignmentRow,
      score_statistics: {
        max: 25,
        min: 0,
        mean: 23,
        median: 24,
        lower_q: 21,
        upper_q: 29,
      },
    });
  });
});

function validateRow(row: Row, tableKeys: string[]) {
  //check that the clean row contains every single key in the table keys and no other keys
  expect(row).toBeDefined();
  //loop through the table keys and check for each key
  for (const key of tableKeys) {
    expect(key in row).toBeTruthy();
  }
  //now check that there are no extra keys
  for (const key in row) {
    expect(tableKeys).toContain(key);
  }
}
