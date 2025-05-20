'use server'

import setSessionCookie from "./setSession";

const postAuth = async (path: string, formData: any) => {
  try {
    const response = await fetch("http://localhost:8080/" + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const data = await response.json();

    console.log(data);
    if (data.session && !data.error) {
      await setSessionCookie(data.session);
      data.session = "true";
    }

    return data;
  } catch (err) {
    console.error(err);
  }
};

export default postAuth;
