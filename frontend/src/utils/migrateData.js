import Dexie from 'dexie';
import * as api from './api';

/**
 * Migrates data from IndexedDB to Azure Cosmos DB
 * @returns {Promise<{success: boolean, message: string}>} Result of migration
 */
export const migrateDataToAzure = async () => {
  try {
    // Get all databases
    const databases = await window.indexedDB.databases();
    let latestDb = null;
    let latestTimestamp = 0;
    
    // Find the latest database
    for (const { name } of databases) {
      if (name && name.startsWith('site_prestart_')) {
        const timestamp = parseInt(name.split('_')[2]);
        if (timestamp > latestTimestamp) {
          latestTimestamp = timestamp;
          latestDb = name;
        }
      }
    }
    
    if (!latestDb) {
      console.log('No database found to migrate');
      return { success: false, message: 'No database found to migrate' };
    }
    
    // Open the database
    const db = new Dexie(latestDb);
    db.version(1).stores({
      users: '++id, email',
      projects: '++id',
      briefings: '++id',
      attendances: '++id, briefingId',
      tokens: '++id, token'
    });
    
    await db.open();
    
    const migrationResults = {
      users: { total: 0, success: 0, failed: 0 },
      projects: { total: 0, success: 0, failed: 0 },
      briefings: { total: 0, success: 0, failed: 0 },
      attendances: { total: 0, success: 0, failed: 0 }
    };
    
    // Migrate users
    const users = await db.users.toArray();
    migrationResults.users.total = users.length;
    
    for (const user of users) {
      try {
        // Check if user already exists
        try {
          await api.getUserByEmail(user.email);
          console.log(`User ${user.email} already exists in Azure DB, skipping`);
          migrationResults.users.success++;
        } catch (error) {
          // User doesn't exist, create it
          await api.register({
            email: user.email,
            password: user.password || 'TemporaryPassword123!', // Default password if none exists
            name: user.name,
            role: user.role || 'site_supervisor',
            company: user.company || '',
            signature: user.signature || ''
          });
          console.log(`Migrated user: ${user.email}`);
          migrationResults.users.success++;
        }
      } catch (error) {
        console.error(`Error migrating user ${user.email}:`, error);
        migrationResults.users.failed++;
      }
    }
    
    // Migrate projects
    const projects = await db.projects.toArray();
    migrationResults.projects.total = projects.length;
    
    for (const project of projects) {
      try {
        await api.createProject({
          name: project.name,
          location: project.location,
          projectManager: project.projectManager,
          active: project.active !== false, // Default to true if not specified
          createdAt: project.createdAt || new Date(),
          updatedAt: project.updatedAt || new Date()
        });
        console.log(`Migrated project: ${project.name}`);
        migrationResults.projects.success++;
      } catch (error) {
        console.error(`Error migrating project ${project.name}:`, error);
        migrationResults.projects.failed++;
      }
    }
    
    // Migrate briefings
    const briefings = await db.briefings.toArray();
    migrationResults.briefings.total = briefings.length;
    
    for (const briefing of briefings) {
      try {
        // Convert local IDs to Azure IDs if needed
        const newBriefing = {
          ...briefing,
          id: undefined, // Remove local ID so a new one is generated
          _id: undefined, // Remove local ID so a new one is generated
          createdAt: briefing.createdAt || new Date(),
          updatedAt: briefing.updatedAt || new Date()
        };
        
        await api.createBriefing(newBriefing);
        console.log(`Migrated briefing: ${briefing.id}`);
        migrationResults.briefings.success++;
      } catch (error) {
        console.error(`Error migrating briefing ${briefing.id}:`, error);
        migrationResults.briefings.failed++;
      }
    }
    
    // Migrate attendances
    const attendances = await db.attendances.toArray();
    migrationResults.attendances.total = attendances.length;
    
    for (const attendance of attendances) {
      try {
        // Convert local IDs to Azure IDs if needed
        const newAttendance = {
          ...attendance,
          id: undefined, // Remove local ID so a new one is generated
          _id: undefined, // Remove local ID so a new one is generated
          createdAt: attendance.createdAt || new Date(),
          updatedAt: attendance.updatedAt || new Date()
        };
        
        await api.createAttendance(newAttendance);
        console.log(`Migrated attendance: ${attendance.id}`);
        migrationResults.attendances.success++;
      } catch (error) {
        console.error(`Error migrating attendance ${attendance.id}:`, error);
        migrationResults.attendances.failed++;
      }
    }
    
    db.close();
    
    const summary = `
      Migration Summary:
      - Users: ${migrationResults.users.success}/${migrationResults.users.total} (${migrationResults.users.failed} failed)
      - Projects: ${migrationResults.projects.success}/${migrationResults.projects.total} (${migrationResults.projects.failed} failed)
      - Briefings: ${migrationResults.briefings.success}/${migrationResults.briefings.total} (${migrationResults.briefings.failed} failed)
      - Attendances: ${migrationResults.attendances.success}/${migrationResults.attendances.total} (${migrationResults.attendances.failed} failed)
    `;
    
    console.log(summary);
    return { 
      success: true, 
      message: 'Data migration completed successfully', 
      results: migrationResults,
      summary
    };
  } catch (error) {
    console.error('Error migrating data:', error);
    return { success: false, message: `Error migrating data: ${error.message}` };
  }
};
