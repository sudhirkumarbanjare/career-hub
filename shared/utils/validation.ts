export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string; formatted?: string } {
  const cleaned = phone.trim().replace(/[\s-]/g, '');
  // Match 10 digit Indian number or +91 followed by 10 digits
  const indian10Regex = /^[6-9]\d{9}$/;
  const e164IndianRegex = /^\+91[6-9]\d{9}$/;

  if (indian10Regex.test(cleaned)) {
    return { isValid: true, formatted: `+91${cleaned}` };
  } else if (e164IndianRegex.test(cleaned)) {
    return { isValid: true, formatted: cleaned };
  } else if (/^\+\d{10,14}$/.test(cleaned)) {
    return { isValid: true, formatted: cleaned };
  }

  return {
    isValid: false,
    error: 'Please enter a valid 10-digit mobile number (e.g. 9876543210)',
  };
}

export function validateOtp(otp: string): boolean {
  return /^\d{6}$/.test(otp.trim());
}

export function validateJob(data: {
  title?: string;
  description?: string;
  category?: string;
  skills?: string[];
  budget?: number;
  deadline?: string;
  location?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.title || data.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters';
  }
  if (!data.description || data.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters';
  }
  if (!data.category || data.category.trim().length === 0) {
    errors.category = 'Category is required';
  }
  if (!data.skills || data.skills.length === 0) {
    errors.skills = 'At least one skill is required';
  }
  if (data.budget === undefined || data.budget <= 0) {
    errors.budget = 'Budget must be greater than 0';
  }
  if (!data.deadline) {
    errors.deadline = 'Deadline is required';
  } else {
    const deadlineDate = new Date(data.deadline);
    if (isNaN(deadlineDate.getTime()) || deadlineDate.getTime() <= Date.now()) {
      errors.deadline = 'Deadline must be a valid future date';
    }
  }
  if (!data.location || data.location.trim().length === 0) {
    errors.location = 'Location or Remote specification is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateClientProfile(data: {
  companyName?: string;
  contactPerson?: string;
  industry?: string;
  location?: string;
  description?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.companyName || data.companyName.trim().length < 2) {
    errors.companyName = 'Company / Business name is required';
  }
  if (!data.contactPerson || data.contactPerson.trim().length < 2) {
    errors.contactPerson = 'Contact person name is required';
  }
  if (!data.industry || data.industry.trim().length < 2) {
    errors.industry = 'Industry is required';
  }
  if (!data.location || data.location.trim().length < 2) {
    errors.location = 'Location is required';
  }
  if (!data.description || data.description.trim().length < 10) {
    errors.description = 'Business description must be at least 10 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateStudentProfile(data: {
  name?: string;
  college?: string;
  branch?: string;
  year?: string;
  semester?: string;
  mobile?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Full name is required';
  }
  if (!data.college || data.college.trim().length < 2) {
    errors.college = 'College / University is required';
  }
  if (!data.branch || data.branch.trim().length === 0) {
    errors.branch = 'Branch is required';
  }
  if (!data.year || data.year.trim().length === 0) {
    errors.year = 'Year is required';
  }
  if (!data.semester || data.semester.trim().length === 0) {
    errors.semester = 'Semester is required';
  }
  if (data.mobile) {
    const phoneCheck = validatePhoneNumber(data.mobile);
    if (!phoneCheck.isValid) {
      errors.mobile = phoneCheck.error || 'Invalid mobile number';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
