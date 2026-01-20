import React, { useState, useMemo, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import API from "../../../utils/api";
import ProductCard from "../../components/Product/ProductCard";
import Footer from "../../components/Footer/Footer";

/* ---------------------------------------------
   BACKEND → UI MAPPER
--------------------------------------------- */
const mapProduct = (p) => ({
  id: p.id,
  title: p.name,
  brand: p.brand || "Brand",
  price: p.price,
  discountedPrice: p.discounted_price || p.price,
  discountPercent: p.discount_percent || 0,
  demand: p.sold || 0,
  category: p.category,
  subcategory: p.subcategory,
  imageUrl:
    p.product_images?.[0]?.image_url ||
    "https://via.placeholder.com/400x500?text=No+Image",
});

export default function ProductListing() {
  const { category, subcategory } = useParams();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [sortBy, setSortBy] = useState("demand");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState("all");
  const [minDiscount, setMinDiscount] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  /* ---------------------------------------------
     FETCH PRODUCTS FROM BACKEND
  --------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/products");
        setProducts(res.data.map(mapProduct));
      } catch (err) {
        console.error("PRODUCT LIST ERROR:", err);
      }
    };
    load();
  }, []);

  /* ---------------------------------------------
     CATEGORY + SEARCH FILTER
  --------------------------------------------- */
  const { filteredProducts, title } = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const q = searchParams.get("q");

    let result = [...products];
    let pageTitle = "All Products";

    if (category) {
      result = result.filter(
        (p) =>
          p.category === category || p.subcategory === category
      );
      pageTitle = category.replace("_", " ").toUpperCase();
    }

    if (subcategory) {
      result = result.filter(
        (p) =>
          p.subcategory === subcategory || p.category === subcategory
      );
      pageTitle = subcategory.replace("_", " ").toUpperCase();
    }

    if (q) {
      const query = q.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query)
      );
      pageTitle = `Search Results for "${q}"`;
    }

    return { filteredProducts: result, title: pageTitle };
  }, [products, category, subcategory, location.search]);

  /* ---------------------------------------------
     BRANDS
  --------------------------------------------- */
  const brands = useMemo(
    () =>
      [...new Set(filteredProducts.map((p) => p.brand))].filter(Boolean),
    [filteredProducts]
  );

  /* ---------------------------------------------
     FINAL FILTER + SORT
  --------------------------------------------- */
  const finalProducts = useMemo(() => {
    let result = [...filteredProducts];

    if (selectedBrands.length) {
      result = result.filter((p) =>
        selectedBrands.includes(p.brand)
      );
    }

    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      result = result.filter((p) => {
        const price = p.discountedPrice;
        return max ? price >= min && price <= max : price >= min;
      });
    }

    if (minDiscount > 0) {
      result = result.filter(
        (p) => p.discountPercent >= minDiscount
      );
    }

    switch (sortBy) {
      case "price-low":
        return result.sort((a, b) => a.discountedPrice - b.discountedPrice);
      case "price-high":
        return result.sort((a, b) => b.discountedPrice - a.discountedPrice);
      case "discount":
        return result.sort((a, b) => b.discountPercent - a.discountPercent);
      default:
        return result.sort((a, b) => b.demand - a.demand);
    }
  }, [
    filteredProducts,
    sortBy,
    selectedBrands,
    priceRange,
    minDiscount,
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedBrands([]);
    setPriceRange("all");
    setMinDiscount(0);
  }, [category, subcategory]);

  return (
    <div className="bg-white min-h-screen flex flex-col">
      {/* HERO */}
      <div className="bg-gradient-to-r from-sky-400 to-blue-500 py-12 text-center">
        <h1 className="text-4xl font-bold text-white capitalize">
          {title}
        </h1>
        <p className="text-sky-100 mt-2">
          {finalProducts.length} products found
        </p>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-8 flex-grow w-full">
        <div className="flex justify-between mb-6">
          <span className="text-sm text-gray-600">
            Showing {finalProducts.length} results
          </span>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm"
          >
            <option value="demand">🔥 Trending</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="discount">Best Discount</option>
          </select>
        </div>

        {finalProducts.length ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {finalProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            No products found
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
