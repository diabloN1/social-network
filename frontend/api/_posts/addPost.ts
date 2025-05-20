'use server'

import { cookies } from 'next/headers'

const addPost = async (formData: {
    image: string;
    caption: string;
    privacy: string;
    session?: string;
  }) => {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value || ''

    formData['session'] = token

    const response = await fetch("http://localhost:8080/addPost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const data = await response.json();

    console.log(data);

    if (data.error == "Invalid session") {
        cookieStore.delete('token');
    }
    return data;
  } catch (err) {
    console.error(err);
  }
};

export default addPost