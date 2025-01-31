import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema'
const sql = neon("postgresql://neondb_owner:npg_EFVZo2rdbLB3@ep-shrill-sun-a8hraqzj-pooler.eastus2.azure.neon.tech/ai_mock?sslmode=require");
export const db = drizzle(sql,{schema});