"use client";

import getToken from "@/api/auth/getToken";
import { socket } from "./webSocket";
import { getGlobalErrorHandler } from "@/context/ErrorContext";

export const addMessage = async (
  id: number,
  isGroup: boolean,
  message: string
) => {
  if (!socket) return;

  try {
    const token = await getToken();
    const showError = getGlobalErrorHandler();
    if (!token) {
      showError("Invalid session. Please log in again.", 401);
      return;
    }

    socket.send(
      JSON.stringify({
        type: "add-message",
        data: { session: token, isGroup, id, message },
      })
    );
  } catch (err) {
    console.error(err);
  }
};
