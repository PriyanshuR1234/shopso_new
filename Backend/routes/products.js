const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const cloudinary = require("../cloudinaryConfig");
const supabase = require("../supabaseClient");




/* ----------------------------------------------
   GET PRODUCTS WITH CATEGORY / SUBCATEGORY FILTERS
------------------------------------------------ */
router.get("/", async (req, res) => {
  const { category, subcategory } = req.query;

  let query = supabase
    .from("products")
    .select("*, product_images(id, image_url)");

  if (category) query = query.eq("category", category);
  if (subcategory) query = query.eq("subcategory", subcategory);

  const { data, error } = await query;

  if (error) return res.status(400).json({ error });

  res.json(data);
});


/* ----------------------------------------------
   1️⃣ GET PRODUCTS FOR A VENDOR
------------------------------------------------ */
router.get("/vendor/:vendor_id", async (req, res) => {
  const { vendor_id } = req.params;

  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(id, image_url)")
    .eq("vendor_id", vendor_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET PRODUCTS ERROR:", error);
    return res.status(400).json({ error });
  }

  res.json(data);
});

/* ----------------------------------------------
   2️⃣ GET SINGLE PRODUCT
------------------------------------------------ */
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

/* ----------------------------------------------
   3️⃣ UPLOAD MULTIPLE IMAGES
------------------------------------------------ */
router.post("/upload-multiple", upload.array("images", 5), async (req, res) => {
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
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* ----------------------------------------------
   4️⃣ ADD PRODUCT (NOW WITH CATEGORY)
------------------------------------------------ */
router.post("/add", async (req, res) => {
  const { vendor_id, name, description, price, stock = 0, image_urls, category, subcategory } =
    req.body;

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

  if (error) return res.status(400).json({ error });

  if (Array.isArray(image_urls) && image_urls.length > 0) {
    const imageData = image_urls.map((url) => ({
      product_id: product.id,
      image_url: url,
    }));

    await supabase.from("product_images").insert(imageData);
  }

  res.json({ message: "Product created", product });
});

/* ----------------------------------------------
   HELPER: CHECK VENDOR OWNERSHIP
------------------------------------------------ */
async function checkVendorOwnership(product_id, vendor_id) {
  const { data } = await supabase
    .from("products")
    .select("vendor_id")
    .eq("id", product_id)
    .single();

  return data?.vendor_id === vendor_id;
}

/* ----------------------------------------------
   5️⃣ UPDATE PRODUCT (WITH CATEGORY)
------------------------------------------------ */
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { vendor_id, name, description, price, stock, category, subcategory } = req.body;

  const allowed = await checkVendorOwnership(id, vendor_id);
  if (!allowed) return res.status(403).json({ error: "Unauthorized" });

  const { data, error } = await supabase
    .from("products")
    .update({ name, description, price, stock, category, subcategory })
    .eq("id", id)
    .select();

  if (error) return res.status(400).json({ error });

  res.json({ message: "Product updated", product: data[0] });
});

/* ----------------------------------------------
   6️⃣ DELETE SINGLE IMAGE
------------------------------------------------ */
router.delete("/delete-image/:image_id", async (req, res) => {
  const { image_id } = req.params;

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", image_id);

  if (error) return res.status(400).json({ error });

  res.json({ message: "Image deleted" });
});

/* ----------------------------------------------
   7️⃣ DELETE PRODUCT
------------------------------------------------ */
router.delete("/delete/:id/:vendor_id", async (req, res) => {
  const { id, vendor_id } = req.params;

  const allowed = await checkVendorOwnership(id, vendor_id);
  if (!allowed) return res.status(403).json({ error: "Unauthorized" });

  await supabase.from("products").delete().eq("id", id);
  res.json({ message: "Product deleted" });
});

module.exports = router;
