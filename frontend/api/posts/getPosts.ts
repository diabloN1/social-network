

const getPosts = async (startId: number) => {
  try {
    const response = await fetch("http://localhost:8080/getPosts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "get-posts",
        data: {
          startId,
        },
      }),
      credentials: "include",
      cache: "no-store",
    });

    const data = await response.json();

    return data;
  } catch (err) {
    console.error("Error fetching posts:", err);
    return { error: "Failed to fetch posts", posts: [] };
  }
};

export default getPosts;
