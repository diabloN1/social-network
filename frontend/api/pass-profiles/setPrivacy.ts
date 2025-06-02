const setPravicy = async (state: boolean) => {
  try {
    const response = await fetch("http://localhost:8080/setPrivacy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        type: "set-privacy",
        data: {
          state,
        },
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (err) {
    console.error(err);
  }
};

export default setPravicy;
