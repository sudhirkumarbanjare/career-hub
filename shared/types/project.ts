export type ProjectType = 'Minor' | 'Major';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type Availability = 'Available' | 'Limited' | 'Booked';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Project {
  project_id: string;
  title: string;
  description: string;
  branch: string;
  project_type: ProjectType;
  technologies: string[];
  difficulty: Difficulty;
  duration: string;
  cost: number;
  availability: Availability;
  capacity: number;
  image?: string;
  components?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProjectBooking {
  booking_id: string;
  student_id: string;
  project_id: string;
  status: BookingStatus;
  booked_at: string;
  updated_at: string;
  project?: Project;
}
