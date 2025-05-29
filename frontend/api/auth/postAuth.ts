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
        type: path, // "register" or "login"
        data: {
          ...formData,
          birth: formData.birth ? new Date(formData.birth).toISOString() : null,
        },
      }),
    });

    const result = await response.json();
    const { data } = result;

    if (data?.session) {
      await setSessionCookie(data.session);
      return { session: true };
    }

    if (data?.error) {
      return {
        error: true,
        field: data.field || "form",
        message: data.message || "Something went wrong.",
      };
    }

    return {
      error: true,
      field: "form",
      message: "Invalid server response.",
    };
  } catch (err) {
    console.error(err);
    return {
      error: true,
      field: "form",
      message: "Network error.",
    };
  }
};

export default postAuth;
