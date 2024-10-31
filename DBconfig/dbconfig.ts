import mongoose, { Connection, Mongoose } from "mongoose"
export async function connect(){
  try{
mongoose.connect(process.env.MONGO_URI!)
const connection=mongoose.connection;
connection.on('connected',()=>{
  console.log('connected to db')
})
connection.on('error',(err)=>{
  console.log("mongo db connection error",err)
  process.exit()
})
  }
  catch(error)
  {
    console.log("db error")
    console.log(error)
  }
}