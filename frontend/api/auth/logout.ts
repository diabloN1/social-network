export default async function logout() {
  try {
    const response = await fetch("http://localhost:8080/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // This will include cookies in the request
    });

    const data = await response.json();

    if (data.error && data.error !== "Session was removed!") {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}
