import {connect} from "@/DBconfig/dbconfig"

import User from "@/models/userModel"

import { NextRequest,NextResponse } from "next/server"

import bcryptjs from "bcryptjs";


 connect()

 export async function POST(request:NextRequest) {
  try {
    const reqBody=await request.json()
    const {username,email,password,confirmPassword}=reqBody
    console.log(reqBody)
    //check if user already exists
    const user=await User.findOne({email})
    if(user)
      {
        return new NextResponse("User already exists", {status: 400})
      }
      //hash the pass
      const salt =await bcryptjs.genSalt(10)
      const hashedpass=await bcryptjs.hash(password,salt)
      const newUser=new User({
        username,
        email,
        password:hashedpass
      })
      const savedUser=await newUser.save()
      console.log(savedUser)
      return NextResponse.json({
        message:"user created successfully",
        success:true,
        savedUser
      })


  } catch (error:any) {
    return NextResponse.json({error:error.message},{status:500})
    
  }
 }