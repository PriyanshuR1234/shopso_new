require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());
const cors = require("cors");
app.use(cors());


// Test route
app.get("/", (req, res) => {
    res.send("Backend is running!");
});



const supabase = require("./supabaseClient");

app.get("/test-supabase", async (req, res) => {
    const { data, error } = await supabase.from("users").select("*");

    res.json({ data, error });
});


//for auth 
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

//for products
const productRoutes = require("./routes/products");
app.use("/products", productRoutes);


//for orders
const orderRoutes = require("./routes/orders");
app.use("/orders", orderRoutes);





app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
