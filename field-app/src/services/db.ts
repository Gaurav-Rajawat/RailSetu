import * as SQLite from 'expo-sqlite';
import { Report } from '../types/report';
import { v4 as uuidv4 } from 'uuid';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const initDb = (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = (async () => {
      const database = await SQLite.openDatabaseAsync('reports.db');
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS reports (
          id TEXT PRIMARY KEY NOT NULL,
          serverId TEXT,
          category TEXT NOT NULL,
          description TEXT NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          gpsAccuracy REAL NOT NULL,
          photoUri TEXT NOT NULL,
          voiceNoteUri TEXT,
          capturedAt TEXT NOT NULL,
          syncStatus TEXT NOT NULL,
          status TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          retryCount INTEGER DEFAULT 0,
          nextRetryAt TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_reports_syncStatus ON reports(syncStatus);
        CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
      `);
      
      // Quick migration for existing DB
      try { await database.execAsync('ALTER TABLE reports ADD COLUMN retryCount INTEGER DEFAULT 0;'); } catch(e) {}
      try { await database.execAsync('ALTER TABLE reports ADD COLUMN nextRetryAt TEXT;'); } catch(e) {}
      
      return database;
    })();
  }
  return dbPromise;
};

export const getDb = async () => {
  return await initDb();
};

export const insertReport = async (
  report: Omit<Report, 'id' | 'serverId' | 'syncStatus' | 'status' | 'createdAt' | 'retryCount' | 'nextRetryAt'>
): Promise<Report> => {
  const database = await getDb();
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  
  const newReport: Report = {
    ...report,
    id,
    serverId: null,
    syncStatus: 'pending',
    status: 'SUBMITTED',
    createdAt,
    retryCount: 0,
    nextRetryAt: null,
  };

  await database.runAsync(
    `INSERT INTO reports (
      id, serverId, category, description, latitude, longitude, 
      gpsAccuracy, photoUri, voiceNoteUri, capturedAt, syncStatus, 
      status, createdAt, retryCount, nextRetryAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newReport.id,
      newReport.serverId,
      newReport.category,
      newReport.description,
      newReport.latitude,
      newReport.longitude,
      newReport.gpsAccuracy,
      newReport.photoUri,
      newReport.voiceNoteUri,
      newReport.capturedAt,
      newReport.syncStatus,
      newReport.status,
      newReport.createdAt,
      newReport.retryCount,
      newReport.nextRetryAt,
    ]
  );

  return newReport;
};

export const updateReport = async (id: string, updates: Partial<Report>): Promise<void> => {
  const database = await getDb();
  
  const setClauses: string[] = [];
  const values: any[] = [];
  
  Object.keys(updates).forEach((key) => {
    setClauses.push(`${key} = ?`);
    values.push((updates as any)[key]);
  });
  
  if (setClauses.length === 0) return;
  
  values.push(id);
  
  const query = `UPDATE reports SET ${setClauses.join(', ')} WHERE id = ?`;
  await database.runAsync(query, values);
};

export const getAllReports = async (): Promise<Report[]> => {
  const database = await getDb();
  const result = await database.getAllAsync<Report>('SELECT * FROM reports ORDER BY createdAt DESC');
  return result;
};

export const getReportById = async (id: string): Promise<Report | null> => {
  const database = await getDb();
  const result = await database.getFirstAsync<Report>('SELECT * FROM reports WHERE id = ?', [id]);
  return result;
};

export const getPendingReports = async (): Promise<Report[]> => {
  const database = await getDb();
  const result = await database.getAllAsync<Report>(
    "SELECT * FROM reports WHERE syncStatus = 'pending' OR syncStatus = 'failed' ORDER BY createdAt ASC"
  );
  return result;
};
