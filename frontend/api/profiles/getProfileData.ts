const getProfileData = async (profileId: number) => {
  try {
    const response = await fetch("http://localhost:8080/getProfile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        type: "get-profile",
        data: {
          profileId: profileId,
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

export default getProfileData;
