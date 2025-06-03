export default async function logout() {
  try {
    const response = await fetch("http://localhost:8080/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "logout",
      }),
      credentials: "include",
    });

    const data = await response.json();

    if (data.error && data.error !== "Session was removed!") {
      throw new Error(data.error.Cause);
    }

    return data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}
