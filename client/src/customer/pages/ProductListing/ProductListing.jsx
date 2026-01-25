import React, { useState, useMemo, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import supabase from "../../../utils/supabaseClient";
import ProductCard from "../../components/Product/ProductCard";
import Footer from "../../components/Footer/Footer";

/* ---------------------------------------------
   BACKEND → UI MAPPER
--------------------------------------------- */
const mapProduct = (p) => {
  const price = p.price || 0;
  const discountedPrice = p.discounted_price || price;
  const discountPercent = p.discount_percent || (price > discountedPrice ? Math.round(((price - discountedPrice) / price) * 100) : 0);

  // Use joined category name if available, else fallback to ID (though ID won't match URL slug usually)
  const categoryName = p.category?.name || p.category_id;
  const subcategoryName = p.subcategory?.name || p.subcategory_id;

  return {
    id: p.id,
    title: p.name,
    brand: p.brand || "Brand",
    price: price,
    discountedPrice: discountedPrice,
    discountPercent: discountPercent,
    demand: p.sold || 0,
    category: categoryName,
    subcategory: subcategoryName,
    // Ensure we check all possible image locations or structure
    imageUrl:
      p.product_images?.[0]?.image_url ||
      "https://placehold.jp/400x500.png?text=No%20Image",
    vendor_id: p.vendor_id,
  };
};

export default function ProductListing() {
  const { category, subcategory } = useParams();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [sortBy, setSortBy] = useState("demand");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState("all");
  const [minDiscount, setMinDiscount] = useState(0);
  // Removed unused state

  /* ---------------------------------------------
     FETCH PRODUCTS FROM BACKEND (WITH CACHE)
  --------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        // 1. Check Cache
        const cached = localStorage.getItem("products_cache");
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const isFresh = Date.now() - timestamp < 60 * 60 * 1000; // 1 hr
          if (isFresh) {
            setProducts(data.map(mapProduct));
            // Background update check could be added here if needed
            return;
          }
        }

        // 2. Fetch Fresh Data with Category Joins
        const { data, error } = await supabase
          .from("products")
          .select("*, product_images(*), category:categories(name), subcategory:subcategories(name)");

        if (error) throw error;

        // 3. Update State & Cache
        const mappedData = data.map(mapProduct); // map before caching?? No, cache raw data usually better, or map then cache. Let's cache raw to stay close to DB.
        // Actually, for simplicity/consistency with previous pattern, I'll cache the RAW data to match the fetch structure.

        setProducts(mappedData);
        localStorage.setItem("products_cache", JSON.stringify({
          data: data, // Store raw DB response
          timestamp: Date.now()
        }));

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
      // Case-insensitive matching for robust URL handling
      const catLower = category.toLowerCase();
      result = result.filter(
        (p) =>
          p.category?.toString().toLowerCase() === catLower ||
          p.subcategory?.toString().toLowerCase() === catLower
      );
      pageTitle = category.replace("_", " ").toUpperCase();
    }

    if (subcategory) {
      const subLower = subcategory.toLowerCase();
      result = result.filter(
        (p) =>
          p.subcategory?.toString().toLowerCase() === subLower ||
          p.category?.toString().toLowerCase() === subLower
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
    <div className="min-h-screen flex flex-col bg-fixed bg-gradient-to-br from-blue-50 via-white to-sky-100">
      {/* HERO */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-500 to-blue-600 py-16 text-center shadow-lg shadow-blue-500/20">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold text-white capitalize tracking-tight drop-shadow-sm">
            {title}
          </h1>
          <p className="text-sky-100 mt-3 text-lg font-medium">
            {finalProducts.length} products found
          </p>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-10 flex-grow w-full flex flex-col md:flex-row gap-8">

        {/* SIDEBAR FILTERS (Left) */}
        <div className="w-full md:w-72 flex-shrink-0 space-y-6">
          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-xl shadow-sky-100/50 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                Filters
              </h3>
              {(selectedBrands.length > 0 || priceRange !== "all" || minDiscount > 0) && (
                <button
                  onClick={() => {
                    setSelectedBrands([]);
                    setPriceRange("all");
                    setMinDiscount(0);
                  }}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Price Range */}
            <div className="mb-8">
              <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Price Range</p>
              <div className="relative">
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full text-sm bg-white/50 border-gray-200 rounded-xl focus:ring-sky-500 focus:border-sky-500 py-3 shadow-sm hover:bg-white/80 transition-all cursor-pointer"
                >
                  <option value="all">All Prices</option>
                  <option value="0-500">Under ₹500</option>
                  <option value="500-1000">₹500 - ₹1000</option>
                  <option value="1000-2000">₹1000 - ₹2000</option>
                  <option value="2000-0">Above ₹2000</option>
                </select>
              </div>
            </div>

            {/* Brands */}
            {brands.length > 0 && (
              <div className="mb-8">
                <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Brands</p>
                <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedBrands([...selectedBrands, brand]);
                            else setSelectedBrands(selectedBrands.filter(b => b !== brand));
                          }}
                          className="peer h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500 transition-all"
                        />
                      </div>
                      <span className="text-sm text-gray-600 group-hover:text-sky-700 transition-colors">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Discount */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Minimum Discount</p>
              <div className="space-y-2.5">
                {[10, 20, 30, 40, 50].map(d => (
                  <label key={d} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="radio"
                        name="minDiscount"
                        checked={minDiscount === d}
                        onChange={() => setMinDiscount(d)}
                        className="peer h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500 transition-all"
                      />
                    </div>
                    <span className="text-sm text-gray-600 group-hover:text-sky-700 transition-colors">{d}% or more</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* MAIN GRID (Right) */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-6 bg-white/60 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-sm">
            <span className="text-gray-600 font-medium">
              Showing <span className="font-bold text-gray-900">{finalProducts.length}</span> results
            </span>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/80 border-gray-200 rounded-lg text-sm focus:ring-sky-500 focus:border-sky-500 px-4 py-2 shadow-sm hover:shadow-md transition-all cursor-pointer outline-none"
              >
                <option value="demand">🔥 Trending</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Best Discount</option>
              </select>
            </div>
          </div>

          {finalProducts.length ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {finalProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white/40 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300/50">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">We couldn't find any products matching your filters.</p>
              <button
                onClick={() => {
                  setSelectedBrands([]);
                  setPriceRange("all");
                  setMinDiscount(0);
                }}
                className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors shadow-lg shadow-sky-500/30"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
