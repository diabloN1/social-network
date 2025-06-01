const requestJoinGroup = async (groupId: number) => {
  try {
    const response = await fetch("http://localhost:8080/requestJoinGroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "request-join-group",
        data: {
          groupId,
        },
      }),
      credentials: "include",
    });
    const data = await response.json();

    console.log("requestJoinGroup response:", data);
    if (data.error) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (err) {
    console.error(err);
  }
};

export default requestJoinGroup;
