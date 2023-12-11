import { CourseSummaryData } from '@/components/course-component/summary-data/new-summary-data';
import { faker } from '@faker-js/faker';

function generateCourse(): CourseSummaryData & { numAssignments: number } {
  // Use faker.date.recent() to generate a past date and subtract the number of days to go back further in time
  const courseYear = faker.date.recent({ days: 365 * 5 }).getFullYear();
  const uploadDate = faker.date.future({ years: 6 }).toISOString();
  const startDate = faker.date.past({ years: 10 }).toISOString();
  // Use faker.date.soon() to generate a future date and add the number of days to go forward in time
  const endDate = faker.date.past({ years: 10 }).toISOString();
  // Use faker.name.fullName() instead of faker.name.findName()
  const instructors =
    Math.random() > 0.5
      ? [
          faker.person.fullName(),
          faker.person.fullName(),
          faker.person.fullName(),
          faker.person.fullName(),
          faker.person.fullName(),
          faker.person.fullName(),
          faker.person.fullName(),
          faker.person.fullName(),
          faker.person.fullName(),
          faker.person.fullName(),
          faker.person.fullName(),
          faker.person.fullName(),
          faker.person.fullName(),
          faker.person.fullName(),
          faker.person.fullName(),
          faker.person.fullName(),
        ]
      : [faker.person.fullName()];

  return {
    name: faker.lorem.words(4).toUpperCase(),
    id: String(faker.number.int()),
    numAssignments: faker.number.int({ min: 1, max: 300 }),
    attributes: {
      semester: faker.helpers.arrayElement(['Fall', 'Spring', 'Summer']),
      courseCode: `${faker.helpers.arrayElement([
        'CSCI',
        'HASS',
        'MEGN',
        'GEGN',
        'MTGN',
        'PHGN',
        'LIMU',
      ])}${faker.number.int({ min: 100, max: 700 })}`,
      courseYear: String(courseYear),
    },
    upload_date: uploadDate,
    start_at: startDate,
    end_at: endDate,
    instructors: instructors,
    creditHours: String(faker.helpers.arrayElement([1, 2, 3, 4])),
    numSections: faker.number.int({ min: 1, max: 10 }),
    courseType: [
      faker.helpers.arrayElement(['Lecture', 'Lab', 'Seminar', 'Studio']),
    ],
    enrollment: faker.number.int({ min: 10, max: 1000 }),
  };
}

export function generateFakeDbResponse(entries = 10) {
  const courses = [];
  for (let i = 0; i < entries; i++) {
    courses.push(generateCourse());
  }
  return courses;
}
