import mongoose from "mongoose";

//Connect MongoDB

const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("DB Connected...");
  });

  await mongoose.connect(`${process.env.MONGO_URI}/lms0`);
};
export default connectDB;
