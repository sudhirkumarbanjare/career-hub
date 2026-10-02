import { Course, CourseEnrollment, EnrollmentStatus } from '../types/course';
import { INITIAL_COURSES } from '../data/mockCourses';
import { FirestoreClient } from '../firebase/firestoreClient';

let coursesStore: Course[] = [...INITIAL_COURSES];
let enrollmentsStore: CourseEnrollment[] = [
  {
    enrollment_id: 'enr-01',
    student_id: 'usr_9999999999',
    course_id: 'course-01',
    status: 'IN_PROGRESS',
    enrolled_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    course: INITIAL_COURSES[0],
  },
];

// Seed Firestore Client Cache
FirestoreClient.seedCache('courses', coursesStore);
FirestoreClient.seedCache('enrollments', enrollmentsStore);

export const CourseService = {
  /** Get all courses matching website catalog */
  async getCourses(filters?: { category?: string; level?: string; query?: string }): Promise<Course[]> {
    let list = [...coursesStore];
    if (filters?.category && filters.category !== 'All') {
      list = list.filter((c) => c.category?.toLowerCase().includes(filters.category!.toLowerCase()));
    }
    if (filters?.level && filters.level !== 'All') {
      list = list.filter((c) => c.level?.toLowerCase() === filters.level!.toLowerCase());
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.focus_area.toLowerCase().includes(q) ||
          c.technologies.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  },

  /** Get single course by ID */
  async getCourseById(courseId: string): Promise<Course | null> {
    const found = coursesStore.find((c) => c.course_id === courseId);
    return found || null;
  },

  /** Enroll in a course */
  async enrollCourse(studentId: string, courseId: string): Promise<{ success: boolean; enrollment?: CourseEnrollment; error?: string }> {
    const course = await this.getCourseById(courseId);
    if (!course) {
      return { success: false, error: 'Course not found' };
    }

    const existing = enrollmentsStore.find((e) => e.student_id === studentId && e.course_id === courseId && e.status !== 'CANCELLED');
    if (existing) {
      return { success: false, error: 'You are already enrolled in this course!' };
    }

    const newEnrollment: CourseEnrollment = {
      enrollment_id: `enr_${Date.now()}`,
      student_id: studentId,
      course_id: courseId,
      status: 'ENROLLED',
      enrolled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      course,
    };

    enrollmentsStore.unshift(newEnrollment);
    return { success: true, enrollment: newEnrollment };
  },

  /** Get enrollments for a student */
  async getStudentEnrollments(studentId: string): Promise<CourseEnrollment[]> {
    return enrollmentsStore
      .filter((e) => e.student_id === studentId || studentId === 'all')
      .map((e) => ({
        ...e,
        course: e.course || coursesStore.find((c) => c.course_id === e.course_id),
      }));
  },
};
