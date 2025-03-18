import mongoose from 'mongoose';

/**
 * Connect to MongoDB using mongoose
 * @param {string} uri - MongoDB connection string
 * @returns {Promise} Mongoose connection promise
 */
const connect = async (uri) => {
  try {
    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    
    // Connect to MongoDB
    const connection = await mongoose.connect(uri, options);
    console.log('Successfully connected to MongoDB');
    return connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise} Mongoose disconnect promise
 */
const disconnect = async () => {
  try {
    await mongoose.disconnect();
    console.log('Successfully disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error.message);
    throw error;
  }
};

export { connect, disconnect };