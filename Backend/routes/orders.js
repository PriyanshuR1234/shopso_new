const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// 1️⃣ CREATE ORDER
router.post("/create", async (req, res) => {
  const { user_id, total_price, status } = req.body;

  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id,
      total_price,
      status: status || "pending"
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error });

  res.json({ message: "Order created", order: data });
});

// 2️⃣ GET ORDERS FOR A USER
router.get("/user/:user_id", async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user_id);

  if (error) return res.status(400).json({ error });

  res.json(data);
});

// 3️⃣ UPDATE ORDER STATUS
router.put("/status/:order_id", async (req, res) => {
  const { order_id } = req.params;
  const { status } = req.body;

  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", order_id)
    .select()
    .single();

  if (error) return res.status(400).json({ error });

  res.json({ message: "Order status updated", order: data });
});

module.exports = router;
