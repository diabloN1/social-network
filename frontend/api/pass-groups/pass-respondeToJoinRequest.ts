const respondToJoinRequest = async (
  userId: number,
  groupId: number,
  accept: boolean
) => {
  try {
    const response = await fetch("http://localhost:8080/respondToJoinRequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "respond-to-join-request",
        data: {
          userId,
          groupId,
          isAccepted: accept,
        },
      }),
      credentials: "include",
    });
    const data = await response.json();

    console.log("respondToJoinRequest response:", data);
    if (data.error) {
      throw new Error(data.error);
    }
    return data.data;
  } catch (err) {
    console.error(err);
  }
};

export default respondToJoinRequest;
