// src/app/[username]/page.tsx
import React from "react";
import { type Metadata } from 'next';
import dbConnect from "@/lib/db";
import Bio from "@/models/Bio";
import NotFound from "../not-found";
import BioPageClient from "@/components/BioPageClient"; // Corrected the import path to match the new filename

// The data fetching function remains the same
async function getBioData(username: string) {
  await dbConnect();
  const bio = await Bio.findOne({ username }).lean();
  if (bio) {
    // Convert ObjectId to string
    bio._id = bio._id.toString();
    bio.userId = bio.userId.toString();
    if (bio.links) {
       bio.links = bio.links.map(link => ({
        ...link,
        _id: link._id ? link._id.toString() : undefined,
      }));
    }
  }
  return bio;
}

// generateMetadata remains the same
export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const content = await getBioData(params.username);

  if (!content) {
    return {
      title: "Profile Not Found",
      description: "The profile you are looking for does not exist.",
    };
  }

  const title = `${content.name || content.username} | Magic Bio`;
  const description = content.bio || `Check out my links!`;
  const imageUrl = content.cover || content.avatar || '/images/og.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: `${content.name || 'User'}'s cover image`,
      }],
    },
     twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

// The page component is now much simpler
export default async function UserBioPage({ params }: { params: { username: string } }) {
  const content = await getBioData(params.username);

  if (!content) {
    return <NotFound />;
  }

  // We pass the fetched data to the client component, which must be cast to any to avoid type issues.
  return <BioPageClient content={content as any} />;
}

