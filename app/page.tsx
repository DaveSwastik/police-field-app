// app/page.tsx (in the new police-field-app project)
"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";

// Define the structure of the notification payload
type IncidentNotification = {
  incidentId: string;
  locationDescription: string;
  incidentType: string;
  coordinates: {
    lat: number;
    lng: number;
  };
};

export default function FieldAppPage() {
  const [vehicleId, setVehicleId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notification, setNotification] = useState<IncidentNotification | null>(
    null
  );
  const [error, setError] = useState("");

  // This effect runs once the user logs in
  useEffect(() => {
    if (!isLoggedIn || !vehicleId) return;

    // Initialize Pusher with client-side keys and the new auth endpoint
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      // --- THIS IS THE NEW, REQUIRED LINE ---
      authEndpoint: "/api/pusher/auth", 
    });

    // Subscribe to the private channel for this specific vehicle
    const channelName = `private-${vehicleId}`;
    const channel = pusher.subscribe(channelName);

    // Listen for the 'new-incident' event
    channel.bind(
      "new-incident",
      (data: IncidentNotification) => {
        console.log("New incident received:", data);
        setNotification(data);
        // Optional: Play a sound
        new Audio('/alert-sound.mp3').play();
      }
    );

    console.log(`Listening for incidents on channel: ${channelName}`);

    // Cleanup function to unsubscribe when the component unmounts
    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [isLoggedIn, vehicleId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (vehicleId.trim()) {
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("Please enter a valid Vehicle ID.");
    }
  };

  // const handleStartNavigation = () => {
  //   if (!notification) return;
  //   const { lat, lng } = notification.coordinates;
  //   // Creates a Google Maps directions URL
  //   const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
  //   // Opens Google Maps in a new tab
  //   window.open(url, "_blank");
  // };
  const handleStartNavigation = () => {
    if (!notification) return;
    const { lat, lng } = notification.coordinates;
    // This format is more reliable for opening Google Maps with directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, "_blank");
  };
  
  const handleAcknowledge = () => {
    setNotification(null); // Clears the notification
  }

  // --- UI Rendering ---

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-800 text-white">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-lg bg-gray-700 p-8 shadow-lg"
        >
          <h1 className="mb-4 text-2xl font-bold">Interceptor Login</h1>
          <p className="mb-6 text-sm text-gray-400">
            Enter your assigned vehicle Call Sign to receive alerts.
          </p>
          <input
            type="text"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            placeholder="e.g., Alpha-1"
            className="w-full rounded-md bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            className="mt-6 w-full rounded-md bg-blue-600 py-2 font-semibold hover:bg-blue-700"
          >
            Go On Duty
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 p-4 text-white">
      {notification ? (
        <div className="w-full max-w-md animate-pulse rounded-xl border-4 border-red-500 bg-gray-800 p-6 text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-red-400">NEW INCIDENT!</h2>
          <p className="mt-4 text-lg font-semibold">{notification.incidentType}</p>
          <p className="mt-2 text-gray-300">{notification.locationDescription}</p>
          <button
            onClick={handleStartNavigation}
            className="mt-8 w-full rounded-lg bg-green-600 py-4 text-xl font-bold hover:bg-green-700"
          >
            START NAVIGATION
          </button>
          <button
            onClick={handleAcknowledge}
            className="mt-4 w-full rounded-lg bg-gray-600 py-2 text-sm font-semibold hover:bg-gray-700"
          >
            Acknowledge & Clear
          </button>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-300">
            Vehicle: {vehicleId}
          </h1>
          <p className="mt-2 text-lg text-green-400">
            On Duty - Standing By for Incidents...
          </p>
        </div>
      )}
    </div>
  );
}