"use client";

import getToken from "@/api/auth/getToken";
//import { handleAPIError } from "./GlobalAPIHelper";

export let socket: WebSocket | null = null;

let listeners: { [key: string]: ((data: any) => void)[] } = ({} = {});

export const connectWebSocket = async (): Promise<WebSocket | null> => {
  if (socket) return socket;

  try {
    const token = await getToken();
    socket = new WebSocket(`ws://localhost:8080/ws?session=${token}`);

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        if (data.error) {
          // handleAPIError(
          //   data.error.cause || "Unknown error",
          //   data.error.code || 500
          // );
          console.error("WebSocket error:", data.error);
          return;
        }

        const type = data?.type;
console.log(data);

        if (type && listeners[type]) {
          listeners[type].forEach((callback) => callback(data.data));
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };


    return socket;
  } catch (error) {
    alert("WebSocket connection failed: " + error);
    return null;
  }
};

export const closeWebSocket = (): void => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
    socket = null;
    listeners = {} = {};
    console.log("🔌 WebSocket connection closed");
  }
};

// Register a callback for a given message type
export const onMessageType = (
  type: string,
  callback: (data: any) => void
): (() => void) => {
  if (!listeners[type]) {
    listeners[type] = [];
  }

  listeners[type].push(callback);

  // Return an unsubscribe function
  return () => {
    listeners[type] = listeners[type]?.filter((cb) => cb !== callback);

    // Clean up if no more listeners
    if (listeners[type]?.length === 0) {
      delete listeners[type];
    }
  };
};
