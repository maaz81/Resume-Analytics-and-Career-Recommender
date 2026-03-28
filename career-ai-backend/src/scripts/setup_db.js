import { query, closePool } from '../config/db.js';
import logger from '../config/logger.js';

const schema = `
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255),
    "full_name" VARCHAR(255) NOT NULL,
    "current_role" VARCHAR(255),
    "years_of_experience" FLOAT,
    "target_role" VARCHAR(255),
    "industry" VARCHAR(255),
    "profile_picture_url" TEXT,
    "bio" TEXT,
    "location" VARCHAR(255),
    "is_email_verified" BOOLEAN DEFAULT FALSE,
    "is_active" BOOLEAN DEFAULT TRUE,
    "oauth_provider" VARCHAR(50),
    "oauth_id" VARCHAR(255),
    "last_login_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "resumes" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
    "version" INTEGER NOT NULL,
    "original_filename" VARCHAR(255) NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "parsing_status" VARCHAR(20) DEFAULT 'pending',
    "parsing_error" TEXT,
    "raw_text" TEXT,
    "parsed_data" JSONB,
    "is_active" BOOLEAN DEFAULT TRUE,
    "uploaded_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "parsed_at" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS "ats_scores" (
    "id" SERIAL PRIMARY KEY,
    "resume_id" INTEGER REFERENCES "resumes"("id") ON DELETE CASCADE,
    "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
    "overall_score" FLOAT NOT NULL,
    "formatting_score" FLOAT,
    "keyword_score" FLOAT,
    "experience_score" FLOAT,
    "issues" JSONB,
    "missing_keywords" JSONB,
    "weak_action_verbs" JSONB,
    "target_role" VARCHAR(255),
    "jd_hash" VARCHAR(255),
    "ai_model_version" VARCHAR(50),
    "scored_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(100),
    "entity_id" VARCHAR(100),
    "metadata" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "user_skills" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
    "resume_id" INTEGER REFERENCES "resumes"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100),
    "proficiency_level" INTEGER,
    "years_of_experience" FLOAT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("user_id", "resume_id", "name")
);

CREATE TABLE IF NOT EXISTS "skill_gaps" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
    "resume_id" INTEGER REFERENCES "resumes"("id") ON DELETE CASCADE,
    "gap_score" FLOAT,
    "match_percentage" FLOAT,
    "missing_skills" JSONB,
    "resume_skills" JSONB,
    "immediate_actions" JSONB,
    "learning_priorities" JSONB,
    "ai_model_version" VARCHAR(50),
    "analyzed_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ai_conversations" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
    "context_snapshot" JSONB,
    "message_count" INTEGER DEFAULT 0,
    "last_message_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ai_messages" (
    "id" SERIAL PRIMARY KEY,
    "conversation_id" INTEGER REFERENCES "ai_conversations"("id") ON DELETE CASCADE,
    "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
    "role" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "learning_roadmaps" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(20) DEFAULT 'active',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

const setup = async () => {
    try {
        logger.info('Starting database schema initialization...');

        // Split schema into individual commands
        const commands = schema
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0);

        for (const command of commands) {
            await query(command);
        }

        logger.info('✅ Database schema initialized successfully');
    } catch (error) {
        logger.error('❌ Database initialization failed', error);
        process.exit(1);
    } finally {
        await closePool();
    }
};

setup();
