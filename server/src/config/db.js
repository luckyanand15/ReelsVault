const mongoose = require('mongoose');
const dns = require('dns');

// Set custom DNS resolvers to ensure MongoDB Atlas SRV query resolution works on local network
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('Unable to set custom DNS resolvers:', dnsErr.message);
}

const connectDB = async () => {
  try {
    const connStr = process.env.atlas_URL || 'mongodb://localhost:27017/reelsvault';
    console.log('Connecting to MongoDB database...');
    const conn = await mongoose.connect(connStr);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

