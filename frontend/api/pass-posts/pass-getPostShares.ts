import { User } from "@/types/user";

const getPostShares = async (postId: number) => {
  try {
    const response = await fetch("http://localhost:8080/getPostShares", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "get-post-shares",
        data: {
          postId: postId,
        },
      }),
      credentials: "include",
    });

    const data = await response.json();

    if (data.error) {
      throw data.error;
    }

    const allusers = data.data?.all_users;
    if (allusers) {
      const currentShares = allusers.filter(
        (user: User) => user.isaccepted === true
      );
      const availableUsers = allusers.filter(
        (user: User) => user.isaccepted === false
      );

      return {
        data: {
          currentShares,
          availableUsers,
        },
      };
    }

    return data;
  } catch (err) {
    console.error(`Error fetching post shares for post ${postId}:`, err);
    return {
      error: "Failed to fetch post shares",
      data: { currentShares: [], availableUsers: [] },
    };
  }
};

export default getPostShares;
