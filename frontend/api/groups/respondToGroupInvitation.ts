const respondToGroupInvitation = async (groupId: number, accept: boolean) => {
  try {
    const response = await fetch(
      "http://localhost:8080/respondToGroupInvitation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "respond-to-group-invitation",
          data: {
            groupId,
            accept,
          },
        }),
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to respond to invitation");
    }

    const data = await response.json();
    console.log("respond to group invitation response", data);
    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (err) {
    console.error(err);
    return { error: "Failed to respond to invitation" };
  }
};

export default respondToGroupInvitation;
