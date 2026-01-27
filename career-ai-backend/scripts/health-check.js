// ============================================
// scripts/health-check.js
// Run: node scripts/health-check.js
// ============================================

import pg from 'pg';
import { createClient } from 'redis';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('\n╔════════════════════════════════════════════╗');
console.log('║   Career AI Backend - Health Check        ║');
console.log('╚════════════════════════════════════════════╝\n');

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

// Helper functions
const success = (message) => {
  console.log(`✅ ${message}`);
  results.passed++;
};

const fail = (message) => {
  console.log(`❌ ${message}`);
  results.failed++;
};

const warn = (message) => {
  console.log(`⚠️  ${message}`);
  results.warnings++;
};

const info = (message) => {
  console.log(`ℹ️  ${message}`);
};

// 1. Check Node.js version
console.log('1️⃣  Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion >= 18) {
  success(`Node.js ${nodeVersion} (Required: >= 18)`);
} else {
  fail(`Node.js ${nodeVersion} (Required: >= 18)`);
}

// 2. Check .env file
console.log('\n2️⃣  Checking environment configuration...');
if (fs.existsSync('.env')) {
  success('.env file exists');
  
  // Check required env vars
  const required = ['JWT_SECRET', 'DB_NAME', 'DB_USER'];
  required.forEach(key => {
    if (process.env[key]) {
      success(`${key} is set`);
    } else {
      fail(`${key} is missing in .env`);
    }
  });

  // Check JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warn('JWT_SECRET should be at least 32 characters');
  }

} else {
  fail('.env file not found');
}

// 3. Check required folders
console.log('\n3️⃣  Checking required folders...');
const folders = ['logs', 'uploads', 'src', 'src/config', 'src/routes', 'src/controllers'];
folders.forEach(folder => {
  if (fs.existsSync(folder)) {
    success(`${folder}/ exists`);
  } else {
    fail(`${folder}/ not found`);
  }
});

// 4. Check PostgreSQL connection
console.log('\n4️⃣  Checking PostgreSQL connection...');
const { Pool } = pg;

const testPostgres = async () => {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'career_ai_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    const client = await pool.connect();
    success('PostgreSQL connection successful');
    
    const result = await client.query('SELECT NOW()');
    info(`Database time: ${result.rows[0].now}`);
    
    // Check if tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    if (tables.rows.length > 0) {
      success(`Found ${tables.rows.length} tables in database`);
      info(`Tables: ${tables.rows.map(r => r.table_name).join(', ')}`);
    } else {
      warn('No tables found. Run schema.sql to create tables.');
    }
    
    client.release();
    await pool.end();
  } catch (error) {
    fail(`PostgreSQL connection failed: ${error.message}`);
  }
};

// 5. Check Redis connection
console.log('\n5️⃣  Checking Redis connection...');
const testRedis = async () => {
  const client = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    },
  });

  client.on('error', () => {
    warn('Redis connection failed (optional - caching will be disabled)');
  });

  try {
    await client.connect();
    const pong = await client.ping();
    if (pong === 'PONG') {
      success('Redis connection successful');
    }
    await client.quit();
  } catch (error) {
    warn(`Redis not available: ${error.message}`);
  }
};

// 6. Check critical files
console.log('\n6️⃣  Checking critical files...');
const criticalFiles = [
  'src/server.js',
  'src/app.js',
  'src/config/env.js',
  'src/config/db.js',
  'src/models/User.js',
  'src/routes/auth.routes.js',
  'package.json',
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    success(`${file} exists`);
  } else {
    fail(`${file} not found`);
  }
});

// 7. Check package.json type
console.log('\n7️⃣  Checking package.json configuration...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.type === 'module') {
    success('package.json has "type": "module"');
  } else {
    fail('package.json missing "type": "module" (required for ES6 imports)');
  }

  if (packageJson.scripts && packageJson.scripts.dev) {
    success('npm run dev script exists');
  } else {
    warn('npm run dev script not found');
  }

} catch (error) {
  fail('package.json not found or invalid');
}

// Run async tests
(async () => {
  await testPostgres();
  await testRedis();
  
  // Print summary
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║            Health Check Summary            ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`\n✅ Passed:   ${results.passed}`);
  console.log(`❌ Failed:   ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}\n`);

  if (results.failed === 0) {
    console.log('🎉 All critical checks passed! You\'re ready to start the server.\n');
    console.log('Run: npm run dev\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some checks failed. Please fix the issues above before starting.\n');
    process.exit(1);
  }
})();