const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Mongodb uri.",process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    try {
      await conn.connection.collection('budgets').dropIndex('organization_1_month_1_year_1');
    } catch (indexErr) {
      // Index may already be sparse/partial or missing
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
  }
};

module.exports = connectDB;
