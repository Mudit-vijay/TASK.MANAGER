//one way to connect to the database other ways are written in notion 
const mongoose=require('mongoose')
const url = process.env.MONGO_URI;
// const connectDB=(url)=>{
//    return mongoose.connect(url,{  
//         useNewUrlParser:true,
//         useUnifiedTopology:true,
//         useCreateIndex:true,
//         useFindAndModify:false,
//         })
// }
const connectDB = async (url) => {
  try {
    await mongoose.connect(url);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1); // Exit the process if connection fails
  }
};
module.exports=connectDB;
