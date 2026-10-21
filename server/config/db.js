const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the connection URI stored in environment variables.
 * Beginner-friendly explanation: Mongoose establishes a connection pool to MongoDB
 * so all database operations across controllers can communicate with the database.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
