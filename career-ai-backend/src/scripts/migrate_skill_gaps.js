import { query, closePool } from '../config/db.js';
import logger from '../config/logger.js';

const migrate = async () => {
    try {
        logger.info('Starting migration to update skill_gaps table...');

        // 1. Add resume_skills column
        await query(`
            ALTER TABLE "skill_gaps" 
            ADD COLUMN IF NOT EXISTS "resume_skills" JSONB;
        `);
        logger.info('✅ Added resume_skills column');

        // 2. Drop weak_skills column if it exists
        await query(`
            ALTER TABLE "skill_gaps" 
            DROP COLUMN IF EXISTS "weak_skills";
        `);
        logger.info('✅ Dropped weak_skills column');

        // 3. Drop strong_skills column if it exists
        await query(`
            ALTER TABLE "skill_gaps" 
            DROP COLUMN IF EXISTS "strong_skills";
        `);
        logger.info('✅ Dropped strong_skills column');

        logger.info('✅ Migration completed successfully');
    } catch (error) {
        logger.error('❌ Migration failed', error);
        process.exit(1);
    } finally {
        await closePool();
    }
};

migrate();
