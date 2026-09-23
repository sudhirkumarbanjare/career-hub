import {
  Project,
  ProjectBooking,
  Course,
  CourseEnrollment,
  Job,
  JobApplication,
  StudentProfile,
  AppNotification,
  User,
} from '@tech2place/shared';
import {
  INITIAL_PROJECTS,
  INITIAL_COURSES,
  INITIAL_APPROVED_JOBS,
} from '../data/mockData';

class StudentServiceManager {
  private projects: Project[] = [...INITIAL_PROJECTS];
  private courses: Course[] = [...INITIAL_COURSES];
  private jobs: Job[] = [...INITIAL_APPROVED_JOBS];
  private bookings: ProjectBooking[] = [];
  private enrollments: CourseEnrollment[] = [];
  private applications: JobApplication[] = [];
  private notifications: AppNotification[] = [
    {
      id: 'notif-1',
      userId: 'usr_student',
      title: 'Welcome to TECH2PLACE',
      body: 'Explore major & minor projects, enroll in industry courses, and apply to top client jobs.',
      read: false,
      createdAt: new Date().toISOString(),
    },
  ];
  private savedJobIds: Set<string> = new Set();
  private currentStudent: StudentProfile | null = null;

  initDefaultStudent(user?: User): StudentProfile {
    if (this.currentStudent) return this.currentStudent;

    const student: StudentProfile = {
      uid: user?.uid || 'usr_student_himanshu',
      student_id: 'STU-2026-001',
      name: user?.name || 'Himanshu Sharma',
      email: 'himanshu.student@example.edu',
      mobile: user?.phoneNumber || '+91 98765 43210',
      location: 'Bangalore, Karnataka',
      gender: 'Male',
      college: 'National Institute of Technology',
      branch: 'CSE / IT',
      year: 'Final Year',
      semester: 'Semester 8',
      skills: ['React Native', 'TypeScript', 'Firebase', 'Python', 'YOLOv8'],
      bio: 'Enthusiastic engineering student specializing in mobile app architecture and applied computer vision systems.',
      savedJobs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.currentStudent = student;
    return student;
  }

  getCurrentStudent(): StudentProfile {
    if (!this.currentStudent) {
      return this.initDefaultStudent();
    }
    return this.currentStudent;
  }

  updateProfile(updates: Partial<StudentProfile>): StudentProfile {
    const current = this.getCurrentStudent();
    this.currentStudent = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.currentStudent;
  }

  // --- Projects ---
  getProjects(filters?: { branch?: string; type?: string; difficulty?: string; search?: string }): Project[] {
    return this.projects.filter((p) => {
      if (filters?.branch && filters.branch !== 'All' && p.branch !== filters.branch) return false;
      if (filters?.type && filters.type !== 'All' && p.project_type !== filters.type) return false;
      if (filters?.difficulty && filters.difficulty !== 'All' && p.difficulty !== filters.difficulty) return false;
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesTech = p.technologies.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesTech) return false;
      }
      return true;
    });
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.project_id === id);
  }

  bookProject(projectId: string): { success: boolean; booking?: ProjectBooking; error?: string } {
    const student = this.getCurrentStudent();
    // Check existing booking
    const alreadyBooked = this.bookings.some(
      (b) => b.student_id === student.uid && b.project_id === projectId && b.status !== 'CANCELLED'
    );
    if (alreadyBooked) {
      return { success: false, error: 'You have already booked this project reservation.' };
    }

    const project = this.getProjectById(projectId);
    if (!project) {
      return { success: false, error: 'Project not found.' };
    }

    const booking: ProjectBooking = {
      booking_id: `BKG-${Date.now().toString().slice(-6)}`,
      student_id: student.uid,
      project_id: projectId,
      status: 'PENDING',
      booked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project,
    };

    this.bookings.unshift(booking);
    return { success: true, booking };
  }

  getMyBookings(): ProjectBooking[] {
    const student = this.getCurrentStudent();
    return this.bookings.filter((b) => b.student_id === student.uid);
  }

  // --- Courses ---
  getCourses(filters?: { category?: string; search?: string }): Course[] {
    return this.courses.filter((c) => {
      if (filters?.category && filters.category !== 'All' && c.category !== filters.category) return false;
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesTech = c.technologies.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesTech) return false;
      }
      return true;
    });
  }

  getCourseById(id: string): Course | undefined {
    return this.courses.find((c) => c.course_id === id);
  }

  enrollCourse(courseId: string): { success: boolean; enrollment?: CourseEnrollment; error?: string } {
    const student = this.getCurrentStudent();
    const alreadyEnrolled = this.enrollments.some(
      (e) => e.student_id === student.uid && e.course_id === courseId && e.status !== 'CANCELLED'
    );
    if (alreadyEnrolled) {
      return { success: false, error: 'You are already enrolled in this course.' };
    }

    const course = this.getCourseById(courseId);
    if (!course) {
      return { success: false, error: 'Course not found.' };
    }

    const enrollment: CourseEnrollment = {
      enrollment_id: `ENR-${Date.now().toString().slice(-6)}`,
      student_id: student.uid,
      course_id: courseId,
      status: 'ENROLLED',
      enrolled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      course,
    };

    this.enrollments.unshift(enrollment);
    return { success: true, enrollment };
  }

  getMyEnrollments(): CourseEnrollment[] {
    const student = this.getCurrentStudent();
    return this.enrollments.filter((e) => e.student_id === student.uid);
  }

  // --- Jobs (Approved Only) ---
  getApprovedJobs(filters?: {
    category?: string;
    jobType?: string;
    isRemote?: boolean;
    search?: string;
    sortBy?: 'latest' | 'budget';
  }): Job[] {
    // Only approved jobs are visible to students per primary architectural rule!
    let list = this.jobs.filter((j) => j.approvalStatus === 'approved');

    if (filters?.category && filters.category !== 'All') {
      list = list.filter((j) => j.category === filters.category);
    }
    if (filters?.jobType && filters.jobType !== 'All') {
      list = list.filter((j) => j.jobType === filters.jobType);
    }
    if (filters?.isRemote !== undefined) {
      list = list.filter((j) => j.isRemote === filters.isRemote);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          (j.clientName && j.clientName.toLowerCase().includes(q)) ||
          j.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filters?.sortBy === 'budget') {
      list.sort((a, b) => b.budget - a.budget);
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }

  getJobById(id: string): Job | undefined {
    return this.jobs.find((j) => j.id === id && j.approvalStatus === 'approved');
  }

  applyToJob(
    jobId: string,
    coverNote?: string,
    resumeUrl?: string
  ): { success: boolean; application?: JobApplication; error?: string } {
    const student = this.getCurrentStudent();
    const job = this.getJobById(jobId);
    if (!job) {
      return { success: false, error: 'Job opening not found or closed.' };
    }

    const alreadyApplied = this.applications.some(
      (a) => a.studentId === student.uid && a.jobId === jobId
    );
    if (alreadyApplied) {
      return { success: false, error: 'You have already submitted an application for this job.' };
    }

    const application: JobApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      jobId,
      jobTitle: job.title,
      clientId: job.clientId,
      companyName: job.clientName || 'Tech2Place Client',
      studentId: student.uid,
      studentName: student.name,
      studentPhone: student.mobile,
      studentEmail: student.email,
      branch: student.branch,
      college: student.college,
      skills: student.skills,
      resumeUrl: resumeUrl || student.resumeUrl,
      coverNote,
      status: 'submitted',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.applications.unshift(application);
    job.applicationsCount = (job.applicationsCount || 0) + 1;

    return { success: true, application };
  }

  getMyApplications(): JobApplication[] {
    const student = this.getCurrentStudent();
    return this.applications.filter((a) => a.studentId === student.uid);
  }

  toggleBookmark(jobId: string): boolean {
    if (this.savedJobIds.has(jobId)) {
      this.savedJobIds.delete(jobId);
      return false;
    } else {
      this.savedJobIds.add(jobId);
      return true;
    }
  }

  isJobBookmarked(jobId: string): boolean {
    return this.savedJobIds.has(jobId);
  }

  getSavedJobs(): Job[] {
    return this.jobs.filter((j) => this.savedJobIds.has(j.id) && j.approvalStatus === 'approved');
  }

  // --- Notifications ---
  getNotifications(): AppNotification[] {
    return this.notifications;
  }

  markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
  }
}

export const StudentService = new StudentServiceManager();
