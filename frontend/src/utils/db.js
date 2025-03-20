import Dexie from 'dexie';
import * as api from './api';

// Set to true to use the API instead of IndexedDB
export const useApi = true;

export const setUseApi = (value) => {
  useApi = value;
};

// Delete all existing databases first
const deleteAllDatabases = async () => {
  try {
    const databases = await window.indexedDB.databases();
    for (const { name } of databases) {
      if (name && name.startsWith('site_prestart_')) {
        console.log(`Deleting database: ${name}`);
        await Dexie.delete(name);
      }
    }
  } catch (error) {
    console.error('Error deleting databases:', error);
  }
};

// Create database instance
const createDatabase = async () => {
  // First delete all existing databases
  await deleteAllDatabases();
  
  // Create a new database with a timestamp
  const dbName = `site_prestart_${Date.now()}`;
  console.log(`Creating new database: ${dbName}`);
  
  const db = new Dexie(dbName);

  try {
    // Define schema with auto-incrementing keys
    db.version(1).stores({
      users: '++id, email',
      projects: '++id',
      briefings: '++id',
      attendances: '++id, briefingId',
      tokens: '++id, token'
    });

    // Open database
    await db.open();
    console.log('Database opened successfully');

    // Create a test user if none exists
    const userCount = await db.users.count();
    if (userCount === 0) {
      await db.users.add({
        email: 'admin@driphta.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'project_manager'
      });
      console.log('Created admin user');
    }

    return db;
  } catch (error) {
    console.error('Error creating database:', error);
    if (db.isOpen()) {
      db.close();
    }
    throw error;
  }
};

// Initialize database
let db = null;

const ensureDb = async () => {
  if (!db || !db.isOpen()) {
    db = await createDatabase();
  }
  return db;
};

// Database operations
export const getUserByEmail = async (email) => {
  if (useApi) {
    try {
      return await api.getUserByEmail(email);
    } catch (error) {
      console.error('API Error getting user by email:', error);
      return null;
    }
  }
  
  // Fallback to IndexedDB if API is not used
  await ensureDb();
  try {
    return await db.users.where('email').equals(email).first();
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

export const createUser = async (userData) => {
  if (useApi) {
    try {
      return await api.register(userData);
    } catch (error) {
      console.error('API Error creating user:', error);
      throw error;
    }
  }
  
  // Fallback to IndexedDB if API is not used
  await ensureDb();
  try {
    const id = await db.users.add(userData);
    return { ...userData, id };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const saveToken = async (tokenData) => {
  if (useApi) {
    try {
      return await api.saveToken(tokenData);
    } catch (error) {
      console.error('API Error saving token:', error);
      throw error;
    }
  }
  
  // Fallback to IndexedDB if API is not used
  await ensureDb();
  try {
    const id = await db.tokens.add(tokenData);
    return { ...tokenData, id };
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
};

export const getTokenByValue = async (token) => {
  if (useApi) {
    try {
      return await api.getTokenByValue(token);
    } catch (error) {
      console.error('API Error getting token:', error);
      return null;
    }
  }
  
  // Fallback to IndexedDB if API is not used
  await ensureDb();
  try {
    return await db.tokens.where('token').equals(token).first();
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Briefing operations
export const getAllBriefings = async () => {
  if (useApi) {
    try {
      return await api.getBriefings();
    } catch (error) {
      console.error('API Error getting all briefings:', error);
      return [];
    }
  }
  
  // Fallback to IndexedDB if API is not used
  await ensureDb();
  try {
    return await db.briefings.toArray();
  } catch (error) {
    console.error('Error getting all briefings:', error);
    return [];
  }
};

export const getBriefing = async (id) => {
  if (useApi) {
    try {
      return await api.getBriefing(id);
    } catch (error) {
      console.error('API Error getting briefing:', error);
      return null;
    }
  }
  
  // Fallback to IndexedDB if API is not used
  await ensureDb();
  try {
    return await db.briefings.get(id);
  } catch (error) {
    console.error('Error getting briefing:', error);
    return null;
  }
};

export const saveBriefing = async (briefing) => {
  if (useApi) {
    try {
      if (briefing.id || briefing._id) {
        const id = briefing.id || briefing._id;
        return await api.updateBriefing(briefing);
      } else {
        return await api.createBriefing(briefing);
      }
    } catch (error) {
      console.error('API Error saving briefing:', error);
      throw error;
    }
  }
  
  // Fallback to IndexedDB if API is not used
  await ensureDb();
  try {
    if (briefing.id) {
      await db.briefings.update(briefing.id, briefing);
      return briefing;
    } else {
      const id = await db.briefings.add(briefing);
      return { ...briefing, id };
    }
  } catch (error) {
    console.error('Error saving briefing:', error);
    throw error;
  }
};

// Attendance operations
export const getBriefingAttendances = async (briefingId) => {
  if (useApi) {
    try {
      return await api.getAttendances(briefingId);
    } catch (error) {
      console.error('API Error getting briefing attendances:', error);
      return [];
    }
  }
  
  // Fallback to IndexedDB if API is not used
  await ensureDb();
  try {
    return await db.attendances.where('briefingId').equals(briefingId).toArray();
  } catch (error) {
    console.error('Error getting briefing attendances:', error);
    return [];
  }
};

export const saveAttendance = async (attendance) => {
  if (useApi) {
    try {
      if (attendance.id || attendance._id) {
        return await api.updateAttendance(attendance);
      } else {
        return await api.createAttendance(attendance);
      }
    } catch (error) {
      console.error('API Error saving attendance:', error);
      throw error;
    }
  }
  
  // Fallback to IndexedDB if API is not used
  await ensureDb();
  try {
    if (attendance.id) {
      await db.attendances.update(attendance.id, attendance);
      return attendance;
    } else {
      const id = await db.attendances.add(attendance);
      return { ...attendance, id };
    }
  } catch (error) {
    console.error('Error saving attendance:', error);
    throw error;
  }
};

export const deleteAttendance = async (id) => {
  if (useApi) {
    try {
      await api.deleteAttendance(id);
      return { success: true };
    } catch (error) {
      console.error('API Error deleting attendance:', error);
      throw error;
    }
  }
  
  // Fallback to IndexedDB if API is not used
  await ensureDb();
  try {
    await db.attendances.delete(id);
    return { success: true };
  } catch (error) {
    console.error('Error deleting attendance:', error);
    throw error;
  }
};

// Project operations
export const getAllProjects = async () => {
  if (useApi) {
    try {
      return await api.getProjects();
    } catch (error) {
      console.error('API Error getting all projects:', error);
      return [];
    }
  }
  
  // Fallback to IndexedDB if API is not used
  await ensureDb();
  try {
    return await db.projects.toArray();
  } catch (error) {
    console.error('Error getting all projects:', error);
    return [];
  }
};

// User operations
export const getAllUsers = async () => {
  if (useApi) {
    try {
      return await api.getUsers();
    } catch (error) {
      console.error('API Error getting all users:', error);
      return [];
    }
  }
  
  // Fallback to IndexedDB if API is not used
  await ensureDb();
  try {
    return await db.users.toArray();
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

// Initialize the database
(async () => {
  try {
    db = await createDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
})();

export default db;
