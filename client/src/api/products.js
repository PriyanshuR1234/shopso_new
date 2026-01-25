// src/api/products.js
import supabase from "../utils/supabaseClient";

/* ----------------------------------------------
   GET PRODUCTS (with filters)
------------------------------------------------ */
export async function getProducts({ category, subcategory }) {
  let query = supabase
    .from("products")
    .select("*, product_images(id, image_url)");

  if (category) query = query.eq("category", category);
  if (subcategory) query = query.eq("subcategory", subcategory);

  const { data, error } = await query;

  if (error) return { error: error.message };

  return { products: data };
}

/* ----------------------------------------------
   GET ALL PRODUCTS FOR A VENDOR
------------------------------------------------ */
export async function getVendorProducts(vendor_id) {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(id, image_url)")
    .eq("vendor_id", vendor_id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { products: data };
}

/* ----------------------------------------------
   GET SINGLE PRODUCT
------------------------------------------------ */
export async function getProduct(id) {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(id, image_url)")
    .eq("id", id)
    .single();

  if (error) return { error: error.message };
  return { product: data };
}

/* ----------------------------------------------
   ADD PRODUCT
------------------------------------------------ */
export async function addProduct({
  vendor_id,
  name,
  description,
  price,
  stock = 0,
  category,
  subcategory,
  image_urls,
}) {
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      vendor_id,
      name,
      description,
      price,
      stock,
      sold: 0,
      category,
      subcategory,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  if (Array.isArray(image_urls) && image_urls.length > 0) {
    const imageData = image_urls.map((url) => ({
      product_id: product.id,
      image_url: url,
    }));

    await supabase.from("product_images").insert(imageData);
  }

  return { product };
}

/* ----------------------------------------------
   UPDATE PRODUCT
------------------------------------------------ */
export async function updateProduct(id, dataObj) {
  const { vendor_id } = dataObj;

  // Validate vendor ownership
  const { data: existing } = await supabase
    .from("products")
    .select("vendor_id")
    .eq("id", id)
    .single();

  if (existing?.vendor_id !== vendor_id) {
    return { error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("products")
    .update(dataObj)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  return { product: data };
}

/* ----------------------------------------------
   DELETE PRODUCT IMAGE
------------------------------------------------ */
export async function deleteProductImage(image_id) {
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", image_id);

  if (error) return { error: error.message };

  return { success: true };
}

/* ----------------------------------------------
   DELETE PRODUCT
------------------------------------------------ */
export async function deleteProduct(id, vendor_id) {
  const { data: existing } = await supabase
    .from("products")
    .select("vendor_id")
    .eq("id", id)
    .single();

  if (existing?.vendor_id !== vendor_id) {
    return { error: "Unauthorized" };
  }

  await supabase.from("products").delete().eq("id", id);
  return { success: true };
}
