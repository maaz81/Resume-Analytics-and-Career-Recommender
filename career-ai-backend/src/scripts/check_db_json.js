import fs from 'fs';
import { query, closePool } from '../config/db.js';

const check = async () => {
    try {
        const out = {};
        
        const res = await query(`
            SELECT conname, pg_get_constraintdef(c.oid) as def
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            WHERE t.relname = 'user_skills';
        `);
        out.user_skills = res.rows;

        const res2 = await query(`
            SELECT conname, pg_get_constraintdef(c.oid) as def
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            WHERE t.relname = 'ats_scores';
        `);
        out.ats_scores = res2.rows;

        const res3 = await query(`
            SELECT conname, pg_get_constraintdef(c.oid) as def
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            WHERE t.relname = 'skill_gaps';
        `);
        out.skill_gaps = res3.rows;
        
        fs.writeFileSync('db_out.json', JSON.stringify(out, null, 2));

    } catch(e) {
        console.error(e);
    } finally {
        await closePool();
    }
}
check();
