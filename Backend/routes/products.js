const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const cloudinary = require("../cloudinaryConfig");
const supabase = require("../supabaseClient");

// -----------------------------------------------------
// 1️⃣ GET PRODUCTS FOR A VENDOR  (MUST BE FIRST)
// -----------------------------------------------------
router.get("/vendor/:vendor_id", async (req, res) => {
  const { vendor_id } = req.params;

  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(id, image_url)")
    .eq("vendor_id", vendor_id);

  if (error) return res.status(400).json({ error });

  res.json(data);
});


// -----------------------------------------------------
// 2️⃣ GET SINGLE PRODUCT (AFTER vendor route)
// -----------------------------------------------------
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(id, image_url)")
    .eq("id", id)
    .single();

  if (error) return res.status(400).json({ error });

  res.json(data);
});



// -----------------------------------------------------
// UPLOAD MULTIPLE IMAGES (MAX 5)
// -----------------------------------------------------
router.post(
  "/upload-multiple",
  upload.array("images", 5),
  async (req, res) => {
    try {
      const urls = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "ecommerce_products",
          });
          return result.secure_url;
        })
      );

      res.json({ urls });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);


// -----------------------------------------------------
// ADD PRODUCT (MULTI IMAGE SUPPORT)
// -----------------------------------------------------
router.post("/add", async (req, res) => {
  const { vendor_id, name, description, price, image_urls } = req.body;

  const { data: product, error } = await supabase
    .from("products")
    .insert({ vendor_id, name, description, price })
    .select()
    .single();

  if (error) return res.status(400).json({ error });

  // ✅ Insert multiple images
  if (Array.isArray(image_urls) && image_urls.length > 0) {
    const imageData = image_urls.map((url) => ({
      product_id: product.id,
      image_url: url,
    }));

    await supabase.from("product_images").insert(imageData);
  }

  res.json({ message: "Product created", product });
});


// -----------------------------------------------------
// AUTH CHECK
// -----------------------------------------------------
async function checkVendorOwnership(product_id, vendor_id) {
  const { data } = await supabase
    .from("products")
    .select("vendor_id")
    .eq("id", product_id)
    .single();

  return data?.vendor_id === vendor_id;
}


// -----------------------------------------------------
// UPDATE PRODUCT DETAILS
// -----------------------------------------------------
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { vendor_id, name, description, price } = req.body;

  const allowed = await checkVendorOwnership(id, vendor_id);
  if (!allowed) return res.status(403).json({ error: "Unauthorized" });

  const { data, error } = await supabase
    .from("products")
    .update({ name, description, price })
    .eq("id", id)
    .select();

  if (error) return res.status(400).json({ error });

  res.json({ message: "Product updated", product: data[0] });
});


// -----------------------------------------------------
// DELETE SINGLE IMAGE
// -----------------------------------------------------
router.delete("/delete-image/:image_id", async (req, res) => {
  const { image_id } = req.params;

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", image_id);

  if (error) return res.status(400).json({ error });

  res.json({ message: "Image deleted" });
});


// -----------------------------------------------------
// DELETE PRODUCT
// -----------------------------------------------------
router.delete("/delete/:id/:vendor_id", async (req, res) => {
  const { id, vendor_id } = req.params;

  const allowed = await checkVendorOwnership(id, vendor_id);
  if (!allowed) return res.status(403).json({ error: "Unauthorized" });

  await supabase.from("products").delete().eq("id", id);
  res.json({ message: "Product deleted" });
});

module.exports = router;
