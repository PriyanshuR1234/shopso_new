import supabase from "../utils/supabaseClient";

export async function uploadProductImages(files = []) {
  const imageUrls = [];

  for (const file of files) {
    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (uploadError) return { error: "Image upload failed" };

    // Get public URL
    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    imageUrls.push(data.publicUrl);
  }

  return { urls: imageUrls };
}
