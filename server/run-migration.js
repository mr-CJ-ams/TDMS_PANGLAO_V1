const pool = require('./db');

async function runMigration() {
  try {
    console.log('Starting email verification migration...');
    
    // Add email verification columns
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
    `);
    console.log('✓ Added email_verified column');
    
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);
    `);
    console.log('✓ Added email_verification_token column');
    
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP;
    `);
    console.log('✓ Added email_verification_expires column');
    
    // Create index for faster token lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(email_verification_token);
    `);
    console.log('✓ Created verification token index');
    
    // Update existing users to have email_verified = FALSE
    await pool.query(`
      UPDATE users SET email_verified = FALSE WHERE email_verified IS NULL;
    `);
    console.log('✓ Updated existing users');
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 