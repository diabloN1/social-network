"use client";

import getToken from "@/api/auth/getToken";
import { socket } from "./webSocket";
import { handleAPIError } from "./GlobalAPIHelper";

export const addMessage = async (
  id: number,
  isGroup: boolean,
  message: string
) => {
  if (!socket) return;

  try {
    const token = await getToken();
    if (!token) {
      handleAPIError("unauthorized: invalid session", 401);
      return;
    }

    socket.send(
      JSON.stringify({
        type: "add-message",
        data: { session: token, isGroup, id, message },
      })
    );
  } catch (err: any) {
    handleAPIError(err.Cause, 500);
    console.error(err);
  }
};
