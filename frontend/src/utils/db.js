import Dexie from 'dexie';

// Create a Dexie database instance
const db = new Dexie('sitePreStartApp');

// Define the database schema with tables and indexes
db.version(1).stores({
  briefings: '++id, date, location, projectManager, supervisor', // Primary key is id (auto-incremented)
  attendances: '++id, briefingId, name, timeOn, timeOff, bac, [briefingId+name]', // Compound index for briefingId+name
  projects: '++id, name, location',
  users: '++id, name, role'
});

// Define initial data for the application
const initialData = {
  projects: [
    { name: 'Mulla Mulla', location: 'Mulla Mulla' },
    { name: 'Site Office', location: 'Perth' },
    { name: 'NPI Building', location: 'Port Hedland' }
  ],
  users: [
    { name: 'Andrew Donaldson', role: 'supervisor' },
    { name: 'Hermmy Mistry', role: 'project_manager' },
    { name: 'Marshall Grove-Miller', role: 'team_member' },
    { name: 'Chis Danzi', role: 'team_member' }
  ]
};

// Function to initialize the database with sample data
export const initializeDatabase = async () => {
  // Check if we already have data
  const projectCount = await db.projects.count();
  const userCount = await db.users.count();
  
  // Only populate if tables are empty
  if (projectCount === 0) {
    await db.projects.bulkAdd(initialData.projects);
  }
  
  if (userCount === 0) {
    await db.users.bulkAdd(initialData.users);
  }
};

// Briefing operations
export const saveBriefing = async (briefing) => {
  if (briefing.id) {
    // Update existing briefing
    await db.briefings.update(briefing.id, briefing);
    return briefing.id;
  } else {
    // Add new briefing
    return await db.briefings.add(briefing);
  }
};

export const getBriefing = async (id) => {
  return await db.briefings.get(id);
};

export const getAllBriefings = async () => {
  return await db.briefings.toArray();
};

export const deleteBriefing = async (id) => {
  // Delete the briefing and all related attendances
  await db.transaction('rw', db.briefings, db.attendances, async () => {
    await db.attendances.where('briefingId').equals(id).delete();
    await db.briefings.delete(id);
  });
};

// Attendance operations
export const saveAttendance = async (attendance) => {
  if (attendance.id) {
    // Update existing attendance
    await db.attendances.update(attendance.id, attendance);
    return await db.attendances.get(attendance.id);
  } else {
    // Add new attendance
    const id = await db.attendances.add(attendance);
    return await db.attendances.get(id);
  }
};

export const getBriefingAttendances = async (briefingId) => {
  return await db.attendances.where('briefingId').equals(briefingId).toArray();
};

export const deleteAttendance = async (id) => {
  await db.attendances.delete(id);
};

// Project operations
export const getAllProjects = async () => {
  return await db.projects.toArray();
};

export const getProject = async (id) => {
  return await db.projects.get(id);
};

// User operations
export const getAllUsers = async () => {
  return await db.users.toArray();
};

export const getUsersByRole = async (role) => {
  return await db.users.where('role').equals(role).toArray();
};

// Initialize the database when this module is imported
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
});

export default db;
