import { query, closePool } from '../config/db.js';

const check = async () => {
    try {
        console.log("Checking user_skills constraints:");
        const res = await query(`
            SELECT conname, pg_get_constraintdef(c.oid) as def
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            WHERE t.relname = 'user_skills';
        `);
        console.log(res.rows);

        console.log("Checking ats_scores constraints:");
        const res2 = await query(`
            SELECT conname, pg_get_constraintdef(c.oid) as def
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            WHERE t.relname = 'ats_scores';
        `);
        console.log(res2.rows);

        console.log("Checking skill_gaps constraints:");
        const res3 = await query(`
            SELECT conname, pg_get_constraintdef(c.oid) as def
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            WHERE t.relname = 'skill_gaps';
        `);
        console.log(res3.rows);
    } catch(e) {
        console.error(e);
    } finally {
        await closePool();
    }
}
check();
