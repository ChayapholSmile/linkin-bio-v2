// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Bio from "@/models/Bio";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    // Create a default bio for the new user
    const newBio = new Bio({
      userId: newUser._id,
      username: username,
      name: username,
      bio: "Welcome to my bio page!",
      links: [],
      social: [],
    });

    await newBio.save();

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
