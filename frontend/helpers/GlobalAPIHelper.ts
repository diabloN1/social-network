"use client";

import { useError } from "@/context/ErrorContext";

export const useGlobalAPIHelper = () => {
  const { showError } = useError();

  const apiCall = async (
    requestData: any,
    method: string,
    url: string
  ): Promise<any> => {
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

      // Check HTTP status not OK (4xx, 5xx)
      if (!response.ok) {
        const errorMessage =
          data?.error?.cause || data?.message || "Unknown error from server";
        const errorCode = data?.error?.code || response.status;

        showError(errorMessage, errorCode);
        return { error: true, message: errorMessage };
      }

      // Check if API returned error in JSON body
      if (data.error) {
        const errorMessage = data.error.cause || "Unknown error";
        const errorCode = data.error.code || 500;

        showError(errorMessage, errorCode);
        return { error: true, message: errorMessage };
      }

      // If all good, return data field or whole response
      return data.data ?? data;
    } catch (err: any) {
      console.error("API call failed:", err);
      showError(err.message || "Unexpected error", 500);
      return { error: true, message: err.message || "Unexpected error" };
    }
  };

  return { apiCall };
};
