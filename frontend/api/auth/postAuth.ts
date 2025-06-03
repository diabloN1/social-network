"use server";

import setSessionCookie from "./setSession";

const postAuth = async (path: string, formData: any) => {
  try {
    const response = await fetch("http://localhost:8080/" + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: path,
        data: formData,
      }),
    });
    const data = await response.json();

    if (data.data?.session && !data.error) {
      await setSessionCookie(data.data?.session);
      data.data.session = "true";
    }

    return data;
  } catch (err) {
    console.error(err);
  }
};

export default postAuth;
