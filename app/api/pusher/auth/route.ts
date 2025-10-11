// police-field-app/app/api/pusher/auth/route.ts (Temporary Debug Version)
import { NextResponse } from "next/server";
import Pusher from "pusher";

export async function POST(req: Request) {
  // --- Start of Debug Block ---
  // This will log the status of your Vercel environment variables.
  console.log("--- Pusher Auth API Called ---");
  console.log("PUSHER_APP_ID:", process.env.PUSHER_APP_ID ? "Loaded" : "MISSING");
  console.log("PUSHER_KEY:", process.env.PUSHER_KEY ? "Loaded" : "MISSING");
  console.log("PUSHER_SECRET:", process.env.PUSHER_SECRET ? "Loaded" : "MISSING");
  console.log("PUSHER_CLUSTER:", process.env.PUSHER_CLUSTER ? "Loaded" : "MISSING");
  // --- End of Debug Block ---

  try {
    // Check if any keys are missing and return an early, clear error if so.
    if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET || !process.env.PUSHER_CLUSTER) {
        throw new Error("Server is missing one or more Pusher environment variables.");
    }
    
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    });
    
    const data = await req.formData();
    const socketId = data.get("socket_id") as string;
    const channel = data.get("channel_name") as string;
    const authResponse = pusher.authorizeChannel(socketId, channel);
    
    console.log("Successfully generated auth response.");
    return NextResponse.json(authResponse);

  } catch (error: any) {
    console.error("Pusher auth error:", error.message);
    return NextResponse.json({ error: "Forbidden: " + error.message }, { status: 403 });
  }
}