// police-field-app/app/api/pusher/auth/route.ts
import { NextResponse } from "next/server";
import Pusher from "pusher";

// Initialize Pusher with your SERVER credentials from your main project
// You must set these in Vercel for this to work in production
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const socketId = data.get("socket_id") as string;
    const channel = data.get("channel_name") as string;

    // For a private channel, we can authorize any logged-in user.
    // In a real app, you would check a session or token here.
    const authResponse = pusher.authorizeChannel(socketId, channel);
    
    return NextResponse.json(authResponse);

  } catch (error) {
    console.error("Pusher auth error:", error);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}