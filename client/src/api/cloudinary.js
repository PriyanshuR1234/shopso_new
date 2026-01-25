// src/api/cloudinary.js

export async function uploadImagesToCloudinary(files) {
  const uploadedUrls = [];

  for (const file of files) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Cloudinary upload failed");
      }

      const data = await response.json();
      if (data.secure_url) {
        uploadedUrls.push(data.secure_url);
      } else {
        throw new Error("Cloudinary response missing secure_url");
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      throw err;
    }
  }

  return uploadedUrls;
}
