import '@testing-library/jest-dom';
import { config } from 'dotenv';
import path from 'path';
import { seedDatabase } from './db/seed';

// Load environment variables from .env.local
config({ path: path.resolve('.env.local') });

// Seed test database before running tests
if (process.env.NODE_ENV === 'test') {
    await seedDatabase();
}
