
import { Assignment, AssignmentGroup } from "./database";

export const getRelevantGroups = (
  assignments: Assignment[],
  assignmentGroups: AssignmentGroup[]
) => {
  return assignmentGroups.filter((group) =>
    assignments.some(
      (assignment) => assignment.assignment_group_id === group.id
    )
  );
};

export const getAssignmentsByGroup = (
  assignments: Assignment[],
  group: AssignmentGroup
) => {
  return assignments.filter((a) => a.assignment_group_id === group.id);
};

