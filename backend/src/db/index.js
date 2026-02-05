import mongoose from 'mongoose';
import { DATABASE_NAME } from '../constants.js';

const databaseConnection = async () => {
  try {
    const connectionString = `${process.env.MONGODB_URI}/${DATABASE_NAME}`;

    if (!connectionString) {
      throw new Error('MONGODB_URI environment variclsable is not defined');
    }

    console.log('Connecting to MongoDB...');

    const connection = await mongoose.connect(connectionString);

    console.log('Database connected successfully:', connection.connection.host);
    console.log('Database name:', connection.connection.name);
  } catch (err) {
    console.error('Error while connecting to the database:', err.message);
    throw err;
  }
};

export default databaseConnection;
