import { showGlobalError } from "@/helpers/ErrorProvider";

export async function uploadFile(
  formData: FormData,
  route: string
): Promise<string> {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      const msg = "No file provided";
      showGlobalError(msg);
      throw new Error(msg);
    }

    if (!file.type.startsWith("image/")) {
      const msg = "Only image files are allowed (by MIME type)";
      showGlobalError(msg);
      throw new Error(msg);
    }

    const allowedExtensions = ["jpg", "jpeg", "png", "gif"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      const msg = "Only .jpg, .jpeg, .png, .gif images are allowed";
      showGlobalError(msg);
      throw new Error(msg);
    }

    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      const msg = "File size must be ≤ 10MB";
      showGlobalError(msg);
      throw new Error(msg);
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
      const msg = data.error;
      showGlobalError(msg);
      throw new Error(msg);
    }

    return "";
  } catch (error: any) {
    const msg = error?.message || "Failed to upload file";
    showGlobalError(msg);
    console.error("Upload Error:", error);
    throw new Error("Failed to upload file: " + msg);
  }
}
