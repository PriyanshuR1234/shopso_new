const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const supabase = require("../supabaseClient");

// USER SIGNUP
router.post("/signup", async (req, res) => {
  const { email, name, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert({
      email,
      name,
      password: hashedPassword,
    })
    .select();

  if (error) return res.status(400).json({ error });

  res.json({ message: "User created!", user: data[0] });
});

// USER LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // 1️⃣ Get user
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    return res.status(400).json({ error: "User not found" });
  }

  // 2️⃣ Verify password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ error: "Incorrect password" });
  }

  // 3️⃣ Check vendor profile
  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // 4️⃣ Respond properly
  res.json({
    message: "Login successful!",
    user,
    vendor: vendor || null   // 👈 THIS IS THE KEY FIX
  });
});


// VENDOR SIGNUP
router.post("/vendor-signup", async (req, res) => {
  const { email, name, password, shop_name, shop_description } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const { data: user, error: userErr } = await supabase
    .from("users")
    .insert({
      email,
      name,
      password: hashedPassword
    })
    .select()
    .single();

  if (userErr) return res.status(400).json({ error: userErr });

  // create vendor profile
  const { data: vendor, error: vendorErr } = await supabase
    .from("vendors")
    .insert({
      user_id: user.id,
      shop_name,
      shop_description
    })
    .select()
    .single();

  if (vendorErr) return res.status(400).json({ error: vendorErr });

  res.json({ message: "Vendor account created!", vendor });
});


module.exports = router;
