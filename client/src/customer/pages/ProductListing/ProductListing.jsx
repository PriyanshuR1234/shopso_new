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
    imageUrl:
      p.product_images?.[0]?.image_url ||
      "https://placehold.jp/400x500.png?text=No%20Image",
    vendor_id: p.vendor_id,
    createdAt: p.created_at,
    is_trending: p.is_trending,
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

  // Responsive filter state: Default closed on mobile (< 768px), open on desktop
  const [showFilters, setShowFilters] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      // Optional: auto-toggle if resizing significantly, but usually user preference is better
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ---------------------------------------------
     FETCH PRODUCTS FROM BACKEND (WITH CACHE)
  --------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const cached = localStorage.getItem("products_cache");
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const isFresh = Date.now() - timestamp < 60 * 60 * 1000; // 1 hr
          if (isFresh) {
            setProducts(data.map(mapProduct));
            return;
          }
        }

        const { data, error } = await supabase
          .from("products")
          .select("*, product_images(*), category:categories(name), subcategory:subcategories(name)");

        if (error) throw error;

        setProducts(data.map(mapProduct));
        localStorage.setItem("products_cache", JSON.stringify({
          data: data,
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
      const queryWords = q.toLowerCase().split(/\s+/).filter(w => w.length > 2); // Filter out tiny words like 'in', 'of'
      if (queryWords.length > 0) {
        // Stage 1: Try strict match (all words)
        let strictMatches = result.filter((p) => {
          const searchPool = `${p.title} ${p.brand} ${p.category} ${p.subcategory}`.toLowerCase();
          return queryWords.every(word => searchPool.includes(word));
        });

        if (strictMatches.length > 0) {
          result = strictMatches;
        } else {
          // Stage 2: Broad match (any word) - for "relevance"
          result = result.filter((p) => {
            const searchPool = `${p.title} ${p.brand} ${p.category} ${p.subcategory}`.toLowerCase();
            return queryWords.some(word => searchPool.includes(word));
          });
        }
      }
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
      case "newest":
        return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "price-low":
        return result.sort((a, b) => a.discountedPrice - b.discountedPrice);
      case "price-high":
        return result.sort((a, b) => b.discountedPrice - a.discountedPrice);
      case "discount":
        return result.sort((a, b) => b.discountPercent - a.discountPercent);
      case "popular":
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

      {/* GLOSSY GLASS-BLACK HEADER */}
      <div className="relative overflow-hidden bg-black py-6 md:py-8 shadow-2xl border-b border-white/10 mt-1">
        {/* Subtle Shine Background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 left-1/4 w-1/2 h-full bg-gradient-to-r from-transparent via-sky-500/20 to-transparent skew-x-12 animate-pulse pointer-events-none"></div>

        <div className="max-w-[1700px] mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-4xl font-black text-white capitalize tracking-tighter italic drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              {title}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
              <span className="w-2 h-0.5 bg-sky-500 rounded-full"></span>
              <p className="text-[10px] md:text-xs font-black text-sky-400 uppercase tracking-widest leading-none">
                {finalProducts.length} Exclusive Listings Found
              </p>
            </div>
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 transition-all active:scale-95 shadow-lg backdrop-blur-md"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            <svg className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-6 flex-grow w-full flex flex-col md:flex-row gap-8">

        {/* SIDEBAR FILTERS (Responsive) */}
        {showFilters && (
          <div className="w-full md:w-72 flex-shrink-0 animate-in fade-in slide-in-from-left duration-300">
            <div className="bg-white/60 backdrop-blur-3xl p-6 rounded-3xl border border-white/50 shadow-2xl shadow-sky-100/50 md:sticky md:top-24 overflow-hidden relative group">
              {/* Desktop Hide Button (Icon Only) */}
              <button
                onClick={() => setShowFilters(false)}
                className="hidden md:flex absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                title="Hide Filters"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>

              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest">
                  <span className="bg-black text-white p-1.5 rounded-lg shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                  </span>
                  Refinement
                </h3>
                {(selectedBrands.length > 0 || priceRange !== "all" || minDiscount > 0) && (
                  <button
                    onClick={() => {
                      setSelectedBrands([]);
                      setPriceRange("all");
                      setMinDiscount(0);
                    }}
                    className="text-[10px] font-black text-red-500 hover:text-red-700 uppercase transition-colors tracking-tighter"
                  >
                    Reset Map
                  </button>
                )}
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">Price Bracket</p>
                <div className="relative">
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full text-xs font-bold uppercase tracking-widest bg-gray-50/50 border-gray-100 rounded-2xl focus:ring-black focus:border-black py-4 px-4 shadow-sm hover:bg-white transition-all cursor-pointer outline-none"
                  >
                    <option value="all">All Values</option>
                    <option value="0-500">Under ₹500</option>
                    <option value="500-1000">₹500 - ₹1000</option>
                    <option value="1000-2000">₹1000 - ₹2000</option>
                    <option value="2000-0">Premium (2k+)</option>
                  </select>
                </div>
              </div>

              {/* Brands */}
              {brands.length > 0 && (
                <div className="mb-8">
                  <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">Brand Legacy</p>
                  <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {brands.map(brand => (
                      <label key={brand} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 cursor-pointer group transition-all">
                        <span className="text-xs font-bold text-gray-600 group-hover:text-black transition-colors uppercase truncate">{brand}</span>
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedBrands([...selectedBrands, brand]);
                            else setSelectedBrands(selectedBrands.filter(b => b !== brand));
                          }}
                          className="peer h-4 w-4 rounded-full border-gray-300 text-black focus:ring-black transition-all"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Discount */}
              <div>
                <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">Value Clearance</p>
                <div className="grid grid-cols-2 gap-2">
                  {[10, 20, 30, 50].map(d => (
                    <label key={d} className={`flex items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${minDiscount === d ? 'bg-black text-white border-black shadow-lg scale-95' : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-300'
                      }`}>
                      <input
                        type="radio"
                        name="minDiscount"
                        checked={minDiscount === d}
                        onChange={() => setMinDiscount(d)}
                        className="hidden"
                      />
                      <span className="text-[10px] font-black uppercase tracking-tight">{d}% Off</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* MAIN GRID (Right) */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-8 bg-white/60 backdrop-blur-md p-4 px-6 rounded-3xl border border-white/50 shadow-sm relative overflow-hidden group">
            {/* Desktop Show Button (Icon Only) */}
            {!showFilters && (
              <button
                onClick={() => setShowFilters(true)}
                className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all mr-4"
              >
                <span className="bg-black text-white p-1.5 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                </span>
                Expand Filters
              </button>
            )}

            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Reporting <span className="text-black italic">{finalProducts.length}</span> Active Items
            </span>

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest hidden sm:inline">Sorting Logic:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest focus:outline-none transition-all cursor-pointer border-none"
              >
                <option value="popular">Popularity</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Best Discount</option>
              </select>
            </div>
          </div>

          {finalProducts.length ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
              {finalProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white/40 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center">
              <div className="text-6xl mb-6 grayscale opacity-20">🔎</div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter italic">No Matches Found</h3>
              <p className="text-xs font-medium text-gray-400 mb-8 uppercase tracking-widest">The current filter set returned zero active consignments.</p>
              <button
                onClick={() => {
                  setSelectedBrands([]);
                  setPriceRange("all");
                  setMinDiscount(0);
                }}
                className="px-8 py-3 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-gray-200"
              >
                Reset Search Vector
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
