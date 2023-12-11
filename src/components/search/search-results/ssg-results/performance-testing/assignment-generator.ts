import { Assignment } from '@/services/database';
import { faker } from '@faker-js/faker';

function generateScoreStatistics() {
  // Randomly decide whether to have score statistics or not
  if (faker.datatype.boolean(0.8)) {
    const max = faker.number.float({ min: 0, max: 100, precision: 0.1 });
    const min = faker.number.float({ min: 0, max: max, precision: 0.1 });
    const mean = faker.number.float({ min: min, max: max, precision: 0.1 });
    const median = faker.number.float({ min: min, max: max, precision: 0.1 });
    const lower_q = faker.number.float({
      min: min,
      max: median,
      precision: 0.1,
    });
    const upper_q = faker.number.float({
      min: median,
      max: max,
      precision: 0.1,
    });

    return { max, min, mean, median, lower_q, upper_q };
  } else {
    return {
      max: 0,
      min: 0,
      mean: 0,
      median: 0,
      lower_q: 0,
      upper_q: 0,
    } as { [key: string]: number };
  }
}

export function generateAssignment(
  courseStart: Date,
  courseEnd: Date,
): Assignment {
  const hasPoints = faker.datatype.boolean();
  const points_possible = hasPoints
    ? faker.number.float({ min: 1, max: 100, precision: 0.1 })
    : null;

  // Generate dates between courseStart and courseEnd
  const createDate = faker.date.between({ from: courseStart, to: courseEnd });
  const updateDate = faker.date.between({ from: createDate, to: courseEnd });
  const dueDate = faker.date.between({ from: createDate, to: courseEnd });

  return {
    id: faker.datatype.number(),
    name: faker.lorem.words(10),
    score_statistics: generateScoreStatistics(),
    points_possible,
    assignment_group_id: faker.datatype.number(),
    due_at: dueDate.toISOString(),
    created_at: createDate.toISOString(),
    updated_at: updateDate.toISOString(),
    allowed_attempts: null, // Add a default value for allowed_attempts
    allowed_extensions: null, // Add a default value for allowed_extensions
    course_id: null, // Add a default value for course_id
    description: null, // Add a default value for description
    // Add default values for other properties as needed
    final_grader_id: null, // Add a default value for final_grader_id
    grading_standard_id: null, // Add a default value for grading_standard_id
    grading_type: null, // Add a default value for grading_type
    omit_from_final_grade: null, // Add a default value for omit_from_final_grade
    // Add default values for other properties
    // ...
    vericite_enabled: null,
  } as Assignment;
}
