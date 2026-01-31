// sync-tables.js
const sequelize = require('./config/db'); // Adjust path to your Sequelize instance
const Admin = require('./models/admins');
const VersionControl = require('./models/versionControl');
const User = require('./models/users');
const SupportManager = require('./models/supportManagers');
const Manager = require('./models/starsManagers');
const Star = require('./models/Star');
const PolicyDocument = require('./models/policyDocuments');

async function syncTables() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');

    console.log('📦 Creating tables...');

    // List tables individually to log
    await Admin.sync({ force: true });
    console.log('✅ Table "admins" created');

    await VersionControl.sync({ force: true });
    console.log('✅ Table "version_control" created');

    await User.sync({ force: true });
    console.log('✅ Table "users" created');

    await SupportManager.sync({ force: true });
    console.log('✅ Table "Supportmanagers" created');

    await Manager.sync({ force: true });
    console.log('✅ Table "managers" created');

    await Star.sync({ force: true });
    console.log('✅ Table "stars" created');

    await PolicyDocument.sync({ force: true });
    console.log('✅ Table "policydocuments" created');

    console.log('🎉 All tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

syncTables();
