const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupNextAuthSessions() {
  try {
    console.log('Setting up NextAuth session tables...');
    
    // Create the session tables using raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`Account\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        \`type\` VARCHAR(191) NOT NULL,
        \`provider\` VARCHAR(191) NOT NULL,
        \`providerAccountId\` VARCHAR(191) NOT NULL,
        \`refresh_token\` TEXT NULL,
        \`access_token\` TEXT NULL,
        \`expires_at\` INT NULL,
        \`token_type\` VARCHAR(191) NULL,
        \`scope\` VARCHAR(191) NULL,
        \`id_token\` TEXT NULL,
        \`session_state\` VARCHAR(191) NULL,
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`Session\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`sessionToken\` VARCHAR(191) NOT NULL,
        \`userId\` VARCHAR(191) NOT NULL,
        \`expires\` DATETIME(3) NOT NULL,
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`VerificationToken\` (
        \`identifier\` VARCHAR(191) NOT NULL,
        \`token\` VARCHAR(191) NOT NULL,
        \`expires\` DATETIME(3) NOT NULL,
        PRIMARY KEY (\`identifier\`, \`token\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `;

    // Add unique constraints
    await prisma.$executeRaw`
      ALTER TABLE \`Account\` ADD CONSTRAINT \`Account_provider_providerAccountId_key\` UNIQUE(\`provider\`, \`providerAccountId\`);
    `;

    await prisma.$executeRaw`
      ALTER TABLE \`Session\` ADD CONSTRAINT \`Session_sessionToken_key\` UNIQUE(\`sessionToken\`);
    `;

    await prisma.$executeRaw`
      ALTER TABLE \`VerificationToken\` ADD CONSTRAINT \`VerificationToken_token_key\` UNIQUE(\`token\`);
    `;

    // Add foreign key constraints
    await prisma.$executeRaw`
      ALTER TABLE \`Account\` ADD CONSTRAINT \`Account_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

    await prisma.$executeRaw`
      ALTER TABLE \`Session\` ADD CONSTRAINT \`Session_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE;
    `;

    console.log('✅ NextAuth session tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up NextAuth session tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupNextAuthSessions();
