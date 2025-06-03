const getAvailableUsersToInvite = async (groupId: number) => {
  try {
    const response = await fetch("http://localhost:8080/getGroupInviteUsers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "get-group-invite-users",
        data: {
          groupId,
        },
      }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to get available users");
    }

    const data = await response.json();

    console.log("get available users to invite response", data);
    if (data.error) {
      throw new Error(data.error);
    }
    return data.data;
  } catch (err) {
    console.error(err);
    return { error: "Failed to get available users" };
  }
};

export default getAvailableUsersToInvite;
