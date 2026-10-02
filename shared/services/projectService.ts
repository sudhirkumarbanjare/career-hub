import { Project, ProjectBooking, BookingStatus } from '../types/project';
import { INITIAL_PROJECTS } from '../data/mockProjects';

let projectsStore: Project[] = [...INITIAL_PROJECTS];
let bookingsStore: ProjectBooking[] = [
  {
    booking_id: 'book-01',
    student_id: 'usr_9999999999',
    project_id: 'proj-ece-01',
    status: 'CONFIRMED',
    booked_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    project: INITIAL_PROJECTS[0],
  },
];

export const ProjectService = {
  /** Get all available projects matching website catalog */
  async getProjects(filters?: { branch?: string; type?: string; difficulty?: string; query?: string }): Promise<Project[]> {
    let list = [...projectsStore];
    if (filters?.branch && filters.branch !== 'All' && filters.branch !== 'All Branches') {
      list = list.filter((p) => p.branch.toLowerCase().includes(filters.branch!.toLowerCase()));
    }
    if (filters?.type && filters.type !== 'All') {
      list = list.filter((p) => p.project_type.toLowerCase() === filters.type!.toLowerCase());
    }
    if (filters?.difficulty && filters.difficulty !== 'All') {
      list = list.filter((p) => p.difficulty.toLowerCase() === filters.difficulty!.toLowerCase());
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.technologies.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  },

  /** Get single project by ID */
  async getProjectById(projectId: string): Promise<Project | null> {
    const found = projectsStore.find((p) => p.project_id === projectId);
    return found || null;
  },

  /** Book a project */
  async bookProject(studentId: string, projectId: string): Promise<{ success: boolean; booking?: ProjectBooking; error?: string }> {
    const project = await this.getProjectById(projectId);
    if (!project) {
      return { success: false, error: 'Project not found' };
    }

    const existing = bookingsStore.find((b) => b.student_id === studentId && b.project_id === projectId && b.status !== 'CANCELLED');
    if (existing) {
      return { success: false, error: 'You have already booked this project!' };
    }

    const newBooking: ProjectBooking = {
      booking_id: `book_${Date.now()}`,
      student_id: studentId,
      project_id: projectId,
      status: 'CONFIRMED',
      booked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project,
    };

    bookingsStore.unshift(newBooking);
    return { success: true, booking: newBooking };
  },

  /** Get bookings for a student */
  async getStudentBookings(studentId: string): Promise<ProjectBooking[]> {
    return bookingsStore
      .filter((b) => b.student_id === studentId || studentId === 'all')
      .map((b) => ({
        ...b,
        project: b.project || projectsStore.find((p) => p.project_id === b.project_id),
      }));
  },
};
