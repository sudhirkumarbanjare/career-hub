import { Difficulty } from './project';

export type EnrollmentStatus = 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Course {
  course_id: string;
  title: string;
  focus_area: string;
  student_outcome: string;
  description: string;
  technologies: string[];
  duration: string;
  level: Difficulty;
  category: string;
  cost: number;
  instructor?: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  enrollment_id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  updated_at: string;
  course?: Course;
}
