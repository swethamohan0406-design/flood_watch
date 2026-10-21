const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Station = require('./models/Station');
const Reading = require('./models/Reading');
const Zone = require('./models/Zone');
const Alert = require('./models/Alert');

/**
 * Seed script to populate initial development data:
 * - 2 Users (admin and observer)
 * - 5 Stations on real rivers (1 danger, 1 warning, 3 normal)
 * - 4 Flood-prone zones linked to stations
 * - 7 Days of readings per station (35 readings total)
 * - 3 Alerts (2 active, 1 resolved)
 */
const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI === 'your_mongodb_connection_string_here') {
      console.error('ERROR: MONGO_URI is not configured in server/.env.');
      console.error('Please configure your real MongoDB connection string before running the seeder.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connection established.');

    // 1. Clear existing database collections
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Station.deleteMany({}),
      Reading.deleteMany({}),
      Zone.deleteMany({}),
      Alert.deleteMany({})
    ]);
    console.log('Existing collections cleared.');

    // 2. Hash default user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123!', salt);

    // 3. Seed Users
    console.log('Seeding users...');
    const users = await User.create([
      {
        name: 'System Administrator',
        email: 'admin@flood.com',
        password: hashedPassword,
        role: 'admin'
      },
      {
        name: 'Field Officer',
        email: 'officer@flood.com',
        password: hashedPassword,
        role: 'observer'
      }
    ]);
    console.log(`Created ${users.length} users.`);

    // 4. Seed Stations (1 Danger, 1 Warning, 3 Normal)
    console.log('Seeding river monitoring stations...');
    const stations = await Station.create([
      {
        name: 'Okhla Barrage',
        riverName: 'Yamuna',
        location: { lat: 28.545, lng: 77.31 },
        warningLevel: 204.5,
        dangerLevel: 205.3,
        currentWaterLevel: 205.8, // > dangerLevel (205.3)
        currentRainfall: 68.5,
        status: 'danger'
      },
      {
        name: 'Pandu Ghat',
        riverName: 'Brahmaputra',
        location: { lat: 26.175, lng: 91.685 },
        warningLevel: 49.5,
        dangerLevel: 50.0,
        currentWaterLevel: 49.75, // > warningLevel (49.5) and < dangerLevel (50.0)
        currentRainfall: 44.0,
        status: 'warning'
      },
      {
        name: 'Dowleswaram',
        riverName: 'Godavari',
        location: { lat: 16.936, lng: 81.772 },
        warningLevel: 13.7,
        dangerLevel: 15.0,
        currentWaterLevel: 11.2, // normal
        currentRainfall: 12.0,
        status: 'normal'
      },
      {
        name: 'Varanasi Ghat',
        riverName: 'Ganga',
        location: { lat: 25.317, lng: 83.013 },
        warningLevel: 70.26,
        dangerLevel: 71.26,
        currentWaterLevel: 67.8, // normal
        currentRainfall: 6.0,
        status: 'normal'
      },
      {
        name: 'Prakasam Barrage',
        riverName: 'Krishna',
        location: { lat: 16.507, lng: 80.605 },
        warningLevel: 16.5,
        dangerLevel: 18.0,
        currentWaterLevel: 13.9, // normal
        currentRainfall: 4.5,
        status: 'normal'
      }
    ]);
    console.log(`Created ${stations.length} stations.`);

    const [okhla, pandu, dowleswaram, varanasi, prakasam] = stations;

    // 5. Seed Flood-Prone Zones linked to stations
    console.log('Seeding flood-prone zones...');
    const zones = await Zone.create([
      {
        name: 'Yamuna Khadar Lowland Settlement',
        riskLevel: 'critical',
        populationAtRisk: 14500,
        station: okhla._id
      },
      {
        name: 'Pandu Port Riparian Colony',
        riskLevel: 'high',
        populationAtRisk: 9200,
        station: pandu._id
      },
      {
        name: 'Godavari Delta Agricultural Sector',
        riskLevel: 'medium',
        populationAtRisk: 6100,
        station: dowleswaram._id
      },
      {
        name: 'Assi Ghat Riverbank Settlement',
        riskLevel: 'low',
        populationAtRisk: 3400,
        station: varanasi._id
      }
    ]);
    console.log(`Created ${zones.length} flood-prone zones.`);

    // 6. Seed 7 days of readings per station (35 readings)
    console.log('Seeding 7 days of historical readings...');
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    const historicalData = [
      // Okhla Barrage (Trending upwards into danger)
      {
        stationId: okhla._id,
        levels: [203.8, 204.1, 204.4, 204.7, 205.1, 205.5, 205.8],
        rainfalls: [15.0, 22.0, 35.0, 48.0, 56.0, 62.0, 68.5]
      },
      // Pandu Ghat (Trending upwards into warning)
      {
        stationId: pandu._id,
        levels: [48.6, 48.9, 49.1, 49.3, 49.55, 49.65, 49.75],
        rainfalls: [10.0, 18.0, 24.0, 30.0, 38.0, 41.0, 44.0]
      },
      // Dowleswaram (Normal fluctuations)
      {
        stationId: dowleswaram._id,
        levels: [10.4, 10.7, 10.9, 11.5, 11.4, 11.3, 11.2],
        rainfalls: [5.0, 8.0, 14.0, 20.0, 15.0, 10.0, 12.0]
      },
      // Varanasi Ghat (Normal baseline)
      {
        stationId: varanasi._id,
        levels: [66.5, 66.8, 67.1, 67.4, 67.6, 67.7, 67.8],
        rainfalls: [2.0, 4.0, 8.0, 12.0, 9.0, 7.0, 6.0]
      },
      // Prakasam Barrage (Normal steady state)
      {
        stationId: prakasam._id,
        levels: [13.1, 13.3, 13.5, 13.6, 13.8, 13.85, 13.9],
        rainfalls: [0.0, 2.0, 3.0, 5.0, 6.0, 4.0, 4.5]
      }
    ];

    const readingDocuments = [];
    historicalData.forEach((stationHistory) => {
      // Index 0 is 6 days ago, Index 6 is today
      stationHistory.levels.forEach((waterLevel, dayIndex) => {
        const daysAgo = 6 - dayIndex;
        readingDocuments.push({
          stationId: stationHistory.stationId,
          waterLevel,
          rainfall: stationHistory.rainfalls[dayIndex],
          recordedAt: new Date(now - daysAgo * oneDayMs)
        });
      });
    });

    const readings = await Reading.insertMany(readingDocuments);
    console.log(`Created ${readings.length} historical readings.`);

    // 7. Seed 3 Alerts (2 active, 1 resolved)
    console.log('Seeding system alerts...');
    const alerts = await Alert.create([
      {
        stationId: okhla._id,
        severity: 'danger',
        message: 'CRITICAL DANGER: Water level at Okhla Barrage on Yamuna reached 205.8m (Danger threshold: 205.3m). Urgent action required!',
        status: 'active',
        createdAt: new Date(now - 1 * oneDayMs)
      },
      {
        stationId: pandu._id,
        severity: 'warning',
        message: 'WARNING: Water level at Pandu Ghat on Brahmaputra reached 49.75m (Warning threshold: 49.5m). Flood monitoring advised.',
        status: 'active',
        createdAt: new Date(now - 2 * oneDayMs)
      },
      {
        stationId: dowleswaram._id,
        severity: 'warning',
        message: 'WARNING: Water level at Dowleswaram on Godavari approached warning threshold during storm surge. Now receded.',
        status: 'resolved',
        createdAt: new Date(now - 4 * oneDayMs)
      }
    ]);
    console.log(`Created ${alerts.length} alerts (2 active, 1 resolved).`);

    // 8. Print summary and credentials
    console.log('\n==================================================');
    console.log('FLOOD MONITORING SYSTEM - SEED COMPLETED');
    console.log('==================================================');
    console.log('Seeded Users:');
    console.log('  Admin Account:');
    console.log('    Email:    admin@flood.com');
    console.log('    Password: Password123!');
    console.log('    Role:     admin\n');
    console.log('  Observer Account:');
    console.log('    Email:    officer@flood.com');
    console.log('    Password: Password123!');
    console.log('    Role:     observer');
    console.log('==================================================\n');

    await mongoose.connection.close();
    console.log('MongoDB connection closed cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error.message);
    try {
      await mongoose.connection.close();
    } catch (_) {}
    process.exit(1);
  }
};

seedDatabase();
