const inviteUserToGroup = async (groupId: number, userId: number) => {
  try {
    const response = await fetch("http://localhost:8080/inviteUserToGroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "invite-user-to-group",
        data: {
          groupId,
          userId,
        },
      }),
      credentials: "include",
    });

    const data = await response.json();

    console.log("invite user to group response", data);

    if (data.error) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (err) {
    console.error(err);
    return { error: "Failed to invite user" };
  }
};

export default inviteUserToGroup;
