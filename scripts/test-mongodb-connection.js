// Script to test connection to Azure Cosmos DB with MongoDB API
// Run this with Node.js: node test-mongodb-connection.js

const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

// Connection string (from .env file or replace with your connection string)
const MONGODB_URI = process.env.MONGODB_URI || 'your_connection_string_here';

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Connected Successfully!');
    console.log(`Connected to: ${mongoose.connection.host}`);
    console.log(`Database name: ${mongoose.connection.name}`);
    
    // Create a simple test schema and model
    const TestSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const Test = mongoose.model('Test', TestSchema);
    
    // Create a test document
    console.log('Creating a test document...');
    const testDoc = await Test.create({ name: 'Test Connection' });
    console.log(`Test document created with ID: ${testDoc._id}`);
    
    // Find the test document
    console.log('Finding the test document...');
    const foundDoc = await Test.findById(testDoc._id);
    console.log('Found document:', foundDoc);
    
    // Delete the test document
    console.log('Deleting the test document...');
    await Test.deleteOne({ _id: testDoc._id });
    console.log('Test document deleted');
    
    console.log('\nConnection test completed successfully!');
    console.log('Your MongoDB connection is working properly.');
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  } finally {
    // Close the connection
    if (mongoose.connection.readyState) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the test
connectToMongoDB();
