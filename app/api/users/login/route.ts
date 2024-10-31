import { connect } from "../../../../DBconfig/dbconfig"

import User from "../../../../models/userModel"
import jwt from "jsonwebtoken"
import { NextRequest, NextResponse } from "next/server"

import bcryptjs from "bcryptjs";

connect()
export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { email, password } = reqBody;
    console.log(reqBody)
    //check if user exists
    const user = await User.findOne({ email })
    console.log("user",user)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    }
    //check if pass is correct
    const validPassword = await bcryptjs.compare(password, user.password)
    if (!validPassword) {
      return NextResponse.json({ error: "invalid password" }, { status: 400 })
    }
    //create a token data (jwt)
    const tokenData = {
      id: user._id,
      username: user.username,
      email: user.email
    }
    //create token
    const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: "30d" })
    const response = NextResponse.json({ mesage: "login successfull", suceess: true })
    response.cookies.set("token", token, {
      httpOnly: true,
    })
    return response;

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
