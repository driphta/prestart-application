import * as db from './db';
import * as api from './api';

// Function to migrate data from IndexedDB to Cosmos DB
export const migrateData = async () => {
  try {
    // Step 1: Get all data from IndexedDB
    const briefings = await db.getAllBriefings();
    const projects = await db.getAllProjects();
    const users = await db.getAllUsers();
    
    // Step 2: Upload projects and users first (as they might be referenced by briefings)
    console.log('Migrating projects...');
    for (const project of projects) {
      try {
        await api.createProject(project);
        console.log(`Project migrated: ${project.name}`);
      } catch (error) {
        console.error(`Failed to migrate project ${project.name}:`, error);
      }
    }
    
    console.log('Migrating users...');
    for (const user of users) {
      try {
        await api.createUser(user);
        console.log(`User migrated: ${user.name}`);
      } catch (error) {
        console.error(`Failed to migrate user ${user.name}:`, error);
      }
    }
    
    // Step 3: Upload briefings and their attendances
    console.log('Migrating briefings and attendances...');
    for (const briefing of briefings) {
      try {
        // Create briefing in Cosmos DB
        const newBriefing = await api.createBriefing(briefing);
        console.log(`Briefing migrated: ${briefing.date} - ${briefing.location}`);
        
        // Get attendances for this briefing
        const attendances = await db.getBriefingAttendances(briefing.id);
        
        // Create each attendance in Cosmos DB
        for (const attendance of attendances) {
          try {
            await api.createAttendance(attendance);
            console.log(`Attendance migrated: ${attendance.name}`);
          } catch (error) {
            console.error(`Failed to migrate attendance ${attendance.name}:`, error);
          }
        }
      } catch (error) {
        console.error(`Failed to migrate briefing ${briefing.id}:`, error);
      }
    }
    
    return { success: true, message: 'Data migration completed successfully' };
  } catch (error) {
    console.error('Data migration failed:', error);
    return { success: false, message: `Data migration failed: ${error.message}` };
  }
};

// Function to check migration status
export const checkMigrationStatus = async () => {
  try {
    // Check if we have data in Cosmos DB
    const briefings = await api.getBriefings();
    return briefings && briefings.length > 0;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};
