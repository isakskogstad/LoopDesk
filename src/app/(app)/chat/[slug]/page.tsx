import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { GroupChat } from "@/components/chat/GroupChat";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ChatRoomPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { slug } = await params;

  // Get or create room
  let room = await db.chatRoom.findUnique({
    where: { slug },
  });

  // Auto-create "loop-impact" room if it doesn't exist
  if (!room && slug === "loop-impact") {
    room = await db.chatRoom.create({
      data: {
        name: "Loop Impact",
        slug: "loop-impact",
        description: "Redaktionsrummet for Loop Impact-teamet",
        isPrivate: false,
      },
    });
  }

  if (!room) {
    redirect("/");
  }

  // Get user data
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <GroupChat
      room={{
        id: room.id,
        name: room.name,
        slug: room.slug,
        description: room.description,
        image: room.image,
      }}
      currentUser={{
        id: user.id,
        name: user.name,
        image: user.image,
      }}
    />
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const room = await db.chatRoom.findUnique({
    where: { slug },
    select: { name: true },
  });

  return {
    title: room ? `#${room.name} - Chatt` : "Chatt",
  };
}
