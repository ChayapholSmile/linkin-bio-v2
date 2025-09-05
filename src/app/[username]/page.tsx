// src/app/[username]/page.tsx
import React from "react";
import { type Metadata } from 'next';
import {
  Column,
  Row,
  Avatar,
  Text,
  Media,
  IconButton,
  Fade,
  Heading,
  OgCard,
  SmartLink,
} from "@once-ui-system/core";
import dbConnect from "@/lib/db";
import Bio from "@/models/Bio";
import NotFound from "../not-found";

// Removed the shared UserBioPageProps type to simplify type inference for the build process.

interface LinkItem {
  title?: string;
  description?: string;
  media?: string;
  direction?: "row" | "column";
  url: string;
  favicon?: string | false;
  size?: "s" | "m" | "l";
}

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

// Generate dynamic metadata for each user page using an inline type for props.
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


export default async function UserBioPage({ params }: { params: { username: string } }) {
  const content = await getBioData(params.username);

  if (!content) {
    return <NotFound />;
  }

  return (
    <Column fillWidth horizontal="center" padding="16">
      <Column maxWidth="m" aspectRatio="2/1" marginBottom="40" paddingY="24">
        {content.cover && (
          <Row fill position="absolute" left="0" top="0" radius="xl" overflow="hidden" border="neutral-alpha-weak">
            <Media sizes="(max-width: 768px) 100vw, 960px" priority fill src={content.cover} alt={content.name || 'Cover image'}/>
            <Fade fill position="absolute" to="top" bottom="0" left="0" pattern={{ display: true, size: "2" }}/>
          </Row>
        )}
        <Column fill center padding="l" gap="4" align="center">
          {content.avatar && (
            <Avatar src={content.avatar} size="xl" />
          )}
          {content.name && (
            <Heading variant="heading-strong-xl" marginTop={content.avatar ? "24" : undefined}>
              {content.name}
            </Heading>
          )}
          {content.bio && (
            <Text variant="body-default-l" onBackground="neutral-weak">
              {content.bio}
            </Text>
          )}
          {content.social?.length > 0 && (
            <Row gap="16" paddingX="l" paddingTop="24" horizontal="center" fillWidth wrap>
              {content.social.map((item: any, index: any) => (
                <IconButton
                  key={index}
                  href={item.link}
                  icon={item.icon}
                  variant="ghost"
                  size="m"
                  tooltipPosition="bottom"
                  tooltip={item.name}
                />
              ))}
            </Row>
          )}
        </Column>
      </Column>

      <Column maxWidth="s" gap="24">
        {content.links?.length > 0 && (
          <>
            {(content.links as LinkItem[]).map((link, index) => (
              <OgCard
                background="transparent"
                border="transparent"
                sizes="(max-width: 768px) 100vw, 768px"
                key={index}
                url={link.url}
                href={link.url}
                direction={link.direction}
                title={link.title}
                description={link.description}
                favicon={link.favicon}
                image={link.media}
                size={link.size || "m"}
              />
            ))}
          </>
        )}
        <Row fillWidth padding="l" horizontal="center" textVariant="label-default-s">
          <Text onBackground="neutral-weak">
            {new Date().getFullYear() + " "}
            / Build your bio with{" "}
            <SmartLink
              href="https://once-ui.com/products/magic-bio"
            >
              Once UI
            </SmartLink>
          </Text>
        </Row>
      </Column>
    </Column>
  );
}

