import { query, closePool } from './src/config/db.js';

async function fixDB() {
    try {
        console.log('Removing duplicates from user_skills...');
        
        await query(`
            DELETE FROM user_skills
            WHERE id NOT IN (
                SELECT MIN(id)
                FROM user_skills
                GROUP BY user_id, name
            )
        `);
        console.log('Duplicates removed.');

        console.log('Attempting to add unique constraint to user_skills...');
        await query('ALTER TABLE "user_skills" ADD CONSTRAINT user_skills_user_id_name_key UNIQUE("user_id", "name")');
        console.log('Successfully added constraint.');
    } catch (e) {
        console.log('Error:', e.message);
    } finally {
        await closePool();
    }
}

fixDB();
