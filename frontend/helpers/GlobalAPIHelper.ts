"use client";

import { useError } from "@/context/ErrorContext";
import { useRouter } from "next/navigation";

export const useGlobalAPIHelper = () => {
  const { showError } = useError();
  const router = useRouter();

  const handleAPIError = (message: string, code: number = 500) => {
    showError(message, code);

    if (message.toLowerCase().startsWith("unauthorized: invalid session")) {
      setTimeout(() => {
        router.push("/auth");
      }, 1000); // Delay allows popup to show
    }

    return { error: true, message };
  };

  const lastCallTimestamps = new Map<string, number>();

  const apiCall = async (
    requestData: any,
    method: string,
    url: string
  ): Promise<any> => {
    const now = Date.now();
    const lastCall = lastCallTimestamps.get(url);

    const THROTTLE_TIME = 3000; // milliseconds

    if (lastCall && now - lastCall < THROTTLE_TIME) {
      console.warn(`Throttled API call to ${url}`);
      return { error: true, message: "Please wait before trying again." };
    }

    lastCallTimestamps.set(url, now);

    try {
      const response = await fetch(`http://localhost:8080/${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          data?.error?.cause || data?.message || "Unknown error from server";
        const code = data?.error?.code || response.status;
        return handleAPIError(message, code);
      }

      if (data.error) {
        const message = data.error.cause || "Unknown error";
        const code = data.error.code || 500;
        return handleAPIError(message, code);
      }

      return data.data ?? data;
    } catch (err: any) {
      console.error("API call failed:", err);
      return handleAPIError(err.message || "Unexpected error", 500);
    }
  };

  return { apiCall };
};
