export async function uploadFile(
  formData: FormData,
  route: string
): Promise<string> {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      throw new Error("No file provided");
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed (by MIME type)");
    }

    // Extension check
    const allowedExtensions = ["jpg", "jpeg", "png", "gif"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new Error("Only .jpg, .jpeg, .png, .gif images are allowed");
    }

    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      throw new Error("File size must be ≤ 10MB");
    }

    const uuid = crypto.randomUUID();
    const uniqueFileName = `${uuid}_${file.name
      .replace(/\s+/g, "-")
      .toLowerCase()}`;

    formData.append("image", file);
    formData.append("path", route);
    formData.append("filename", uniqueFileName);

    const response = await fetch("http://localhost:8080/uploadImage", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      return uniqueFileName;
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return ""
  } catch (error) {
    console.error(error);
    throw new Error("Failed to upload file: " + error);
  }
}
