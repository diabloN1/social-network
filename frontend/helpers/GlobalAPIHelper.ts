import { redirect } from "next/navigation";

const GlobalAPIHelper = async (
  requestData: any,
  method: string,
  url: string
) => {
  try {
    const response = await fetch(`http://localhost:8080/${url}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (data.error) {
      const { cause, code } = data.error;
      const encodedCause = encodeURIComponent(cause || "Unknown error");
      const errorCode = code || 500;

      redirect(`/error/${errorCode}?cause=${encodedCause}`);
    }

    return data.data;
  } catch (err: any) {
    console.error("API Error:", err);
    const fallbackCause = encodeURIComponent(err.message || "Unexpected error");
    redirect(`/error/500?cause=${fallbackCause}`);
  }
};

export default GlobalAPIHelper;
