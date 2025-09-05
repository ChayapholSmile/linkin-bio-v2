// src/models/Bio.ts
import mongoose from "mongoose";

const LinkSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: { type: String, required: true },
  favicon: { type: Boolean, default: false },
});

const BioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  avatar: String,
  cover: String,
  bio: String,
  links: [LinkSchema],
  social: [
    {
      name: String,
      icon: String,
      link: String,
    },
  ],
});

export default mongoose.models.Bio || mongoose.model("Bio", BioSchema);
