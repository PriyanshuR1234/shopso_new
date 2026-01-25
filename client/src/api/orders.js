// src/api/orders.js
import supabase from "../utils/supabaseClient";

/* ----------------------------------------------
   1️⃣ CREATE ORDER
------------------------------------------------ */
export async function createOrder({ user_id, vendor_id, items, status }) {
  if (!items || items.length === 0) {
    return { error: "No items in order" };
  }

  const total_price = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  // 1️⃣ Insert order
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id,
      vendor_id,
      total_price,
      status: status || "pending",
    })
    .select()
    .single();

  if (orderErr) return { error: orderErr.message };

  // 2️⃣ Insert order_items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    vendor_id,
    quantity: item.quantity,
    price: item.price,
  }));

  await supabase.from("order_items").insert(orderItems);

  // 3️⃣ Update product stock/sold via RPC
  for (const item of items) {
    await supabase.rpc("decrement_stock", {
      product_id_input: item.product_id,
      quantity_input: item.quantity,
    });

    await supabase.rpc("increment_sold", {
      product_id_input: item.product_id,
      quantity_input: item.quantity,
    });
  }

  return { order };
}

/* ----------------------------------------------
   2️⃣ GET USER ORDERS
------------------------------------------------ */
export async function getUserOrders(user_id) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };
  return { orders: data };
}

/* ----------------------------------------------
   3️⃣ GET VENDOR ORDERS + ANALYTICS
------------------------------------------------ */
export async function getVendorOrders(vendor_id) {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("vendor_id", vendor_id)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message };

  /* ---------------- STATS ---------------- */
  const totalOrders = orders.length;
  const completed = orders.filter((o) => o.status === "completed").length;
  const pending = orders.filter((o) => o.status === "pending").length;
  const revenue = orders.reduce(
    (sum, o) => sum + Number(o.total_price || 0),
    0
  );

  /* ---------------- MONTHLY ---------------- */
  const monthlyMap = {};
  orders.forEach((o) => {
    const key = new Date(o.created_at).toLocaleString("en-US", { month: "short" });
    monthlyMap[key] = (monthlyMap[key] || 0) + Number(o.total_price);
  });
  const monthlyRevenue = Object.entries(monthlyMap).map(([month, amount]) => ({
    month,
    amount,
  }));

  /* ---------------- DAILY ---------------- */
  const dailyMap = {};
  orders.forEach((o) => {
    const key = new Date(o.created_at).toLocaleDateString("en-US");
    dailyMap[key] = (dailyMap[key] || 0) + Number(o.total_price);
  });
  const dailyRevenue = Object.entries(dailyMap).map(([day, amount]) => ({
    day,
    amount,
  }));

  /* ---------------- WEEKLY ---------------- */
  const weeklyMap = {};
  orders.forEach((o) => {
    const d = new Date(o.created_at);
    const start = new Date(d.getFullYear(), 0, 1);
    const week = `Week ${Math.ceil(
      ((d - start) / 86400000 + start.getDay() + 1) / 7
    )}`;

    weeklyMap[week] = (weeklyMap[week] || 0) + Number(o.total_price);
  });
  const weeklyRevenue = Object.entries(weeklyMap).map(([week, amount]) => ({
    week,
    amount,
  }));

  /* ---------------- TOP PRODUCTS ---------------- */
  const salesMap = {};

  orders.forEach((order) => {
    order.order_items?.forEach((item) => {
      salesMap[item.product_id] =
        (salesMap[item.product_id] || 0) + Number(item.quantity);
    });
  });

  let topProducts = [];
  const productIds = Object.keys(salesMap);

  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from("products")
      .select("id, name")
      .in("id", productIds);

    topProducts = products
      .map((p) => ({
        name: p.name,
        sold: salesMap[p.id] || 0,
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 8);
  }

  return {
    totalOrders,
    completed,
    pending,
    revenue,
    monthlyRevenue,
    dailyRevenue,
    weeklyRevenue,
    topProducts,
    orders,
  };
}

/* ----------------------------------------------
   4️⃣ GET SINGLE ORDER
------------------------------------------------ */
export async function getOrderDetails(order_id) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", order_id)
    .single();

  if (error) return { error: error.message };
  return { order: data };
}

/* ----------------------------------------------
   5️⃣ UPDATE ORDER STATUS
------------------------------------------------ */
export async function updateOrderStatus(order_id, status) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", order_id)
    .select()
    .single();

  if (error) return { error: error.message };
  return { order: data };
}
