export const APP_NAME = 'GoTechPlace';
export const APP_DOMAIN = 'gotechplace.com';
export const APP_URL = 'https://gotechplace.com';
export const APP_TAGLINE = 'Empowering student projects, practical skills, and client career opportunities.';

export const APPLICATION_IDS = {
  student: 'com.gotechplace.student',
  client: 'com.gotechplace.client',
  admin: 'com.gotechplace.admin',
} as const;

export const DEFAULT_APP_VERSIONS = {
  student: {
    latestVersion: '1.0.0',
    minimumVersion: '1.0.0',
    updateMode: 'optional' as const,
    updateTitle: 'Update Available',
    updateMessage: 'A new version of GoTechPlace Student is available. Please update for the best experience.',
    androidStoreUrl: 'https://play.google.com/store/apps/details?id=com.gotechplace.student',
    maintenance: false,
    enabled: true,
  },
  client: {
    latestVersion: '1.0.0',
    minimumVersion: '1.0.0',
    updateMode: 'optional' as const,
    updateTitle: 'Update Available',
    updateMessage: 'A new version of GoTechPlace Client is available. Please update to continue posting and managing jobs.',
    androidStoreUrl: 'https://play.google.com/store/apps/details?id=com.gotechplace.client',
    maintenance: false,
    enabled: true,
  },
  admin: {
    latestVersion: '1.0.0',
    minimumVersion: '1.0.0',
    updateMode: 'force' as const,
    updateTitle: 'Required Admin Console Update',
    updateMessage: 'A new secure version of GoTechPlace Admin Console is required to access platform operations.',
    androidStoreUrl: 'https://play.google.com/store/apps/details?id=com.gotechplace.admin',
    maintenance: false,
    enabled: true,
  },
} as const;

export const BRANCHES = [
  'CSE / IT',
  'ECE / EC',
  'Electrical / EEE',
  'Mechanical',
  'Civil',
  'Other',
] as const;

export const YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  'Final Year',
] as const;

export const SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
] as const;

export const GENDERS = [
  'Male',
  'Female',
  'Other',
  'Prefer not to say',
] as const;

export const PROJECT_TYPES = ['All', 'Minor', 'Major'] as const;

export const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;

export const JOB_TYPES = ['All', 'Internship', 'Full-time', 'Part-time', 'Contract', 'Freelance'] as const;

export const DEFAULT_CATEGORIES = [
  'Mobile Development',
  'Web Development',
  'Machine Learning & AI',
  'Embedded & IoT',
  'Cloud & DevOps',
  'Cybersecurity',
  'UI/UX Design',
  'Data Analytics',
] as const;
