import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Simulation of Job Lifecycle
class JobLifecycleEngine {
  constructor() {
    this.jobs = [];
    this.applications = [];
  }

  createJob(clientId, clientName, jobData) {
    const job = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      clientId,
      clientName,
      title: jobData.title,
      description: jobData.description,
      category: jobData.category,
      skills: jobData.skills,
      budget: jobData.budget,
      deadline: jobData.deadline,
      location: jobData.location,
      isRemote: !!jobData.isRemote,
      status: 'pending_approval',
      approvalStatus: 'pending',
      applicationsCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.jobs.push(job);
    return job;
  }

  getStudentMarketplaceJobs() {
    // Only approved jobs are visible to students
    return this.jobs.filter((j) => j.status === 'approved' && j.approvalStatus === 'approved');
  }

  getClientJobs(clientId) {
    return this.jobs.filter((j) => j.clientId === clientId);
  }

  approveJob(jobId, adminUid) {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) return false;
    job.status = 'approved';
    job.approvalStatus = 'approved';
    job.approvedBy = adminUid;
    job.approvedAt = new Date().toISOString();
    return true;
  }

  rejectJob(jobId, adminUid, reason) {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) return false;
    job.status = 'rejected';
    job.approvalStatus = 'rejected';
    job.rejectedBy = adminUid;
    job.rejectionReason = reason;
    job.rejectedAt = new Date().toISOString();
    return true;
  }

  applyToJob(jobId, studentUid, studentName) {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job || job.status !== 'approved') {
      throw new Error('Cannot apply to unapproved or inactive job');
    }
    const app = {
      id: `app-${Date.now()}`,
      jobId,
      studentId: studentUid,
      studentName,
      status: 'applied',
      createdAt: new Date().toISOString(),
    };
    this.applications.push(app);
    job.applicationsCount += 1;
    return app;
  }
}

describe('Job Moderation & Student Marketplace Visibility', () => {
  test('Newly created client job is pending and NOT visible in student marketplace', () => {
    const engine = new JobLifecycleEngine();
    const job = engine.createJob('cli-1', 'Nexus Tech', {
      title: 'Full Stack Engineer',
      description: 'Design robust web and mobile cloud services.',
      category: 'Software Engineering',
      skills: ['TypeScript', 'Node.js'],
      budget: 50000,
      deadline: '2026-12-31',
      location: 'Remote',
      isRemote: true,
    });

    assert.equal(job.status, 'pending_approval');
    assert.equal(job.approvalStatus, 'pending');

    // Check student marketplace
    const studentJobs = engine.getStudentMarketplaceJobs();
    assert.equal(studentJobs.length, 0);

    // Check client can see their own pending job
    const clientJobs = engine.getClientJobs('cli-1');
    assert.equal(clientJobs.length, 1);
    assert.equal(clientJobs[0].id, job.id);
  });

  test('Admin approval immediately publishes job to student marketplace', () => {
    const engine = new JobLifecycleEngine();
    const job = engine.createJob('cli-1', 'Nexus Tech', {
      title: 'React Native Dev',
      description: 'Build Android apps.',
      category: 'Mobile Development',
      skills: ['React Native'],
      budget: 40000,
      deadline: '2026-12-31',
      location: 'Bangalore',
      isRemote: false,
    });

    const approved = engine.approveJob(job.id, 'admin-01');
    assert.equal(approved, true);

    const studentJobs = engine.getStudentMarketplaceJobs();
    assert.equal(studentJobs.length, 1);
    assert.equal(studentJobs[0].id, job.id);
    assert.equal(studentJobs[0].approvalStatus, 'approved');
  });

  test('Admin rejection prevents job from appearing to students and provides feedback', () => {
    const engine = new JobLifecycleEngine();
    const job = engine.createJob('cli-1', 'Nexus Tech', {
      title: 'Suspicious Job',
      description: 'Deposit 500 to start.',
      category: 'General',
      skills: ['Data Entry'],
      budget: 10000,
      deadline: '2026-12-31',
      location: 'Remote',
      isRemote: true,
    });

    const rejected = engine.rejectJob(job.id, 'admin-01', 'Deposit request violates platform policy.');
    assert.equal(rejected, true);

    const studentJobs = engine.getStudentMarketplaceJobs();
    assert.equal(studentJobs.length, 0);

    const clientJobs = engine.getClientJobs('cli-1');
    assert.equal(clientJobs[0].status, 'rejected');
    assert.equal(clientJobs[0].rejectionReason, 'Deposit request violates platform policy.');
  });

  test('Student cannot apply to a job that has not been approved', () => {
    const engine = new JobLifecycleEngine();
    const job = engine.createJob('cli-1', 'Nexus Tech', {
      title: 'Pending Job',
      description: 'Build APIs.',
      category: 'Backend',
      skills: ['Go'],
      budget: 60000,
      deadline: '2026-12-31',
      location: 'Remote',
      isRemote: true,
    });

    assert.throws(
      () => {
        engine.applyToJob(job.id, 'stu-1', 'Aarav Patel');
      },
      /Cannot apply to unapproved/
    );
  });

  test('Student can apply to an approved job and increments application counter', () => {
    const engine = new JobLifecycleEngine();
    const job = engine.createJob('cli-1', 'Nexus Tech', {
      title: 'Approved Job',
      description: 'Android developer position.',
      category: 'Mobile',
      skills: ['Kotlin'],
      budget: 45000,
      deadline: '2026-12-31',
      location: 'Pune',
      isRemote: false,
    });

    engine.approveJob(job.id, 'admin-01');

    const app = engine.applyToJob(job.id, 'stu-1', 'Aarav Patel');
    assert.equal(app.studentId, 'stu-1');
    assert.equal(app.status, 'applied');

    const updatedJob = engine.getClientJobs('cli-1')[0];
    assert.equal(updatedJob.applicationsCount, 1);
  });
});
