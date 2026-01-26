'use client'

import { Fragment, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'


import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@headlessui/react'
import { Bars3Icon, MagnifyingGlassIcon, ShoppingBagIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

const navigation = {
  categories: [
    {
      id: 'women',
      name: 'Women',
      featured: [
        {
          name: 'New Arrivals',
          href: '/women/clothing/saree',
          imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/mega-menu-category-01.jpg',
          imageAlt: 'Models sitting back to back, wearing Basic Tee in black and bone.',
        },
        {
          name: 'Basic Tees',
          href: '/women/clothing/tops',
          imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/mega-menu-category-02.jpg',
          imageAlt: 'Close up of Basic Tee fall bundle with off-white, ochre, olive, and black tees.',
        },
      ],
      sections: [
        {
          id: 'clothing',
          name: 'Clothing',
          items: [
            { name: 'Tops', href: '/search?q=women tops' },
            { name: 'Dresses', href: '/women/clothing/women_dress' },
            { name: 'Sarees', href: '/women/clothing/saree' },
            { name: 'Pants', href: '/search?q=women pants' },
            { name: 'Denim', href: '/search?q=women denim' },
            { name: 'Sweaters', href: '/search?q=women sweaters' },
            { name: 'T-Shirts', href: '/search?q=women t-shirts' },
            { name: 'Jackets', href: '/search?q=women jackets' },
            { name: 'Activewear', href: '/search?q=women activewear' },
            { name: 'Browse All', href: '/Fashion' },
          ],
        },
        {
          id: 'accessories',
          name: 'Accessories',
          items: [
            { name: 'Watches', href: '/search?q=women watches' },
            { name: 'Wallets', href: '/search?q=women wallets' },
            { name: 'Bags', href: '/search?q=women bags' },
            { name: 'Sunglasses', href: '/search?q=women sunglasses' },
            { name: 'Hats', href: '/search?q=women hats' },
            { name: 'Belts', href: '/search?q=women belts' },
          ],
        },
        {
          id: 'brands',
          name: 'Brands',
          items: [
            { name: 'Full Nelson', href: '/search?q=Full Nelson' },
            { name: 'My Way', href: '/search?q=My Way' },
            { name: 'Re-Arranged', href: '/search?q=Re-Arranged' },
            { name: 'Counterfeit', href: '/search?q=Counterfeit' },
            { name: 'Significant Other', href: '/search?q=Significant Other' },
          ],
        },
      ],
    },
    {
      id: 'men',
      name: 'Men',
      featured: [
        {
          name: 'New Arrivals',
          href: '/men/clothing/mens_kurta',
          imageSrc:
            'https://tailwindcss.com/plus-assets/img/ecommerce-images/product-page-04-detail-product-shot-01.jpg',
          imageAlt: 'Drawstring top with elastic loop closure and textured interior padding.',
        },
        {
          name: 'Artwork Tees',
          href: '/men/clothing/t-shirts',
          imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/category-page-02-image-card-06.jpg',
          imageAlt:
            'Three shirts in gray, white, and blue arranged on table with same line drawing of hands and shapes overlapping on front of shirt.',
        },
      ],
      sections: [
        {
          id: 'clothing',
          name: 'Clothing',
          items: [
            { name: 'Mens Kurtas', href: '/men/clothing/mens_kurta' },
            { name: 'Tops', href: '/search?q=mens tops' },
            { name: 'Pants', href: '/search?q=mens pants' },
            { name: 'Sweaters', href: '/search?q=mens sweaters' },
            { name: 'T-Shirts', href: '/search?q=mens t-shirts' },
            { name: 'Jackets', href: '/search?q=mens jackets' },
            { name: 'Activewear', href: '/search?q=mens activewear' },
            { name: 'Browse All', href: '/Fashion' },
          ],
        },
        {
          id: 'footwear',
          name: 'Footwear',
          items: [
            { name: 'Shoes', href: '/men/footwear/shoes' },
            { name: 'Sneakers', href: '/search?q=mens sneakers' },
            { name: 'Boots', href: '/search?q=mens boots' },
          ],
        },
        {
          id: 'accessories',
          name: 'Accessories',
          items: [
            { name: 'Watches', href: '/search?q=mens watches' },
            { name: 'Wallets', href: '/search?q=mens wallets' },
            { name: 'Bags', href: '/search?q=mens bags' },
            { name: 'Sunglasses', href: '/search?q=mens sunglasses' },
            { name: 'Hats', href: '/search?q=mens hats' },
            { name: 'Belts', href: '/search?q=mens belts' },
          ],
        },
        {
          id: 'brands',
          name: 'Brands',
          items: [
            { name: 'Re-Arranged', href: '/search?q=Re-Arranged' },
            { name: 'Counterfeit', href: '/search?q=Counterfeit' },
            { name: 'Full Nelson', href: '/search?q=Full Nelson' },
            { name: 'My Way', href: '/search?q=My Way' },
          ],
        },
      ],
    },
  ],
  pages: [
    { name: 'Company', href: '#' },
    { name: 'Stores', href: '#' },
  ],
}

import supabase from '../utils/supabaseClient'

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [cartCount, setCartCount] = useState(0);

  const [expandedMobileSection, setExpandedMobileSection] = useState(null)
  const [user, setUser] = useState(null);

  useEffect(() => {
    const syncState = (e) => {
      if (!e || e.key === "user") {
        const u = JSON.parse(localStorage.getItem("user") || "null");
        setUser(u);
      }
      if (!e || e.key === "cart") {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const count = cart.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
      }
    };

    // Initial load
    syncState();

    const syncUser = () => syncState({ key: "user" });
    const syncCart = () => syncState({ key: "cart" });

    window.addEventListener("storage", syncState);
    window.addEventListener("user-session-change", syncUser);
    window.addEventListener("cart-updated", syncCart);

    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener("user-session-change", syncUser);
      window.removeEventListener("cart-updated", syncCart);
    };
  }, []);

  // Handle Search Input Change with Dynamic Supabase Search
  const handleSearchChange = async (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length > 1) {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, brand")
          .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
          .limit(5);

        if (error) throw error;

        // Map to match existing suggestion UI
        const matches = data.map(p => ({
          id: p.id,
          title: p.name, // compatibility with existing UI
          brand: p.brand
        }));

        setSuggestions(matches)
        setShowSuggestions(true)
      } catch (err) {
        console.error("Search error:", err);
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (item) => {
    navigate(`/search?q=${encodeURIComponent(item.title)}`)
    setSearchQuery(item.title)
    setShowSuggestions(false)
  }

  return (
    <>
      {/* Mobile menu */}
      <Dialog open={open} onClose={setOpen} className="relative z-[100] lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />
        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <div className="flex px-4 pt-5 pb-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            {/* Links */}
            <TabGroup className="mt-2">
              <div className="border-b border-gray-200">
                <TabList className="-mb-px flex space-x-8 px-4">
                  {navigation.categories.map((category) => (
                    <Tab
                      key={category.name}
                      className="flex-1 border-b-2 border-transparent px-1 py-4 text-base font-medium whitespace-nowrap text-gray-900 data-selected:border-sky-600 data-selected:text-sky-600 data-selected:glass-blue data-selected:px-3 data-selected:rounded-md data-selected:border-none"
                    >
                      {category.name}
                    </Tab>
                  ))}
                </TabList>
              </div>
              <TabPanels as={Fragment}>
                {navigation.categories.map((category) => (
                  <TabPanel key={category.name} className="space-y-10 px-4 pt-10 pb-8">
                    <div className="grid grid-cols-2 gap-x-4">
                      {category.featured.map((item) => (
                        <div key={item.name} className="group relative text-sm">
                          <img
                            alt={item.imageAlt}
                            src={item.imageSrc}
                            className="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
                          />
                          <a href={item.href} onClick={() => setOpen(false)} className="mt-6 block font-medium text-gray-900">
                            <span aria-hidden="true" className="absolute inset-0 z-10" />
                            {item.name}
                          </a>
                          <p aria-hidden="true" className="mt-1">
                            Shop now
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-10 transition-all">
                      {category.sections.map((section) => (
                        <div key={section.name}>
                          <p id={`${category.id}-${section.id}-heading-mobile`} className="text-xs font-black text-gray-900 uppercase tracking-widest border-b pb-2 mb-4">
                            {section.name}
                          </p>
                          <ul
                            role="list"
                            aria-labelledby={`${category.id}-${section.id}-heading-mobile`}
                            className="flex flex-col space-y-4"
                          >
                            {section.items.map((item) => (
                              <li key={item.name} className="flow-root">
                                <a href={item.href} onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-400 hover:text-sky-600 transition-colors">
                                  {item.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </TabPanel>
                ))}
              </TabPanels>
            </TabGroup>

            <div className="space-y-6 border-t border-gray-200 px-4 py-6">
              {navigation.pages.map((page) => (
                <div key={page.name} className="flow-root">
                  <a href={page.href} onClick={() => setOpen(false)} className="-m-2 block p-2 font-medium text-gray-900">
                    {page.name}
                  </a>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-gray-200 px-4 py-6">
              {!user ? (
                <>
                  {/* SIGN IN ACCORDION */}
                  <div className="flow-root">
                    <button
                      onClick={() => setExpandedMobileSection(expandedMobileSection === 'signin' ? null : 'signin')}
                      className="-m-2 flex w-full items-center justify-between p-2 font-medium text-gray-900 transition-colors hover:text-sky-600"
                    >
                      <span>Sign in</span>
                      <ChevronDownIcon className={`size-4 transition-transform duration-200 ${expandedMobileSection === 'signin' ? 'rotate-180 text-sky-600' : 'text-gray-400'}`} />
                    </button>
                    {expandedMobileSection === 'signin' && (
                      <div className="mt-4 space-y-4 pl-4 border-l-2 border-sky-100 animate-in fade-in slide-in-from-top-1 duration-200">
                        <a href="/user/login" onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-600 hover:text-sky-600">
                          User Login
                        </a>
                        <a href="/vendor/login" onClick={() => setOpen(false)} className="block text-sm font-medium text-sky-600 hover:text-sky-700">
                          Vendor Partner Login
                        </a>
                      </div>
                    )}
                  </div>

                  {/* SIGN UP ACCORDION */}
                  <div className="flow-root mt-4">
                    <button
                      onClick={() => setExpandedMobileSection(expandedMobileSection === 'signup' ? null : 'signup')}
                      className="-m-2 flex w-full items-center justify-between p-2 font-medium text-gray-900 transition-colors hover:text-sky-600"
                    >
                      <span>Create account</span>
                      <ChevronDownIcon className={`size-4 transition-transform duration-200 ${expandedMobileSection === 'signup' ? 'rotate-180 text-sky-600' : 'text-gray-400'}`} />
                    </button>
                    {expandedMobileSection === 'signup' && (
                      <div className="mt-4 space-y-4 pl-4 border-l-2 border-sky-100 animate-in fade-in slide-in-from-top-1 duration-200">
                        <a href="/user/signup" onClick={() => setOpen(false)} className="block text-sm font-medium text-gray-600 hover:text-sky-600">
                          User Signup
                        </a>
                        <a href="/vendor/signup" onClick={() => setOpen(false)} className="block text-sm font-medium text-sky-600 hover:text-sky-700">
                          Vendor Partner Signup
                        </a>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flow-root border-b border-gray-50 pb-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-black text-xs">
                        {String(user.profile?.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Authenticated</p>
                        <p className="text-sm font-bold text-gray-900 leading-none">{user.profile?.name || "User Account"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flow-root">
                    <a href="/profile" onClick={() => setOpen(false)} className="-m-2 block p-2 font-medium text-gray-900 hover:text-sky-600 transition">
                      My Profile
                    </a>
                  </div>
                  <div className="flow-root">
                    <a href="/orders" onClick={() => setOpen(false)} className="-m-2 block p-2 font-medium text-gray-900 hover:text-sky-600 transition">
                      Orders
                    </a>
                  </div>
                  <div className="flow-root mt-4">
                    <button
                      onClick={async () => {
                        try {
                          await supabase.auth.signOut();
                          localStorage.removeItem("user");
                          localStorage.removeItem("vendor");
                          window.dispatchEvent(new Event("user-session-change"));
                          setOpen(false);
                          window.location.href = "/";
                        } catch (err) {
                          console.error("Logout error:", err);
                        }
                      }}
                      className="w-full text-left -m-2 block p-2 font-black text-red-500 uppercase text-[10px] tracking-widest hover:text-red-600 transition"
                    >
                      Logout Session
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-gray-200 px-4 py-6">
              <a href="#" className="-m-2 flex items-center p-2">
                <span className="text-lg">🇮🇳</span>
                <span className="ml-3 block text-base font-medium text-gray-900">INR</span>
                <span className="sr-only">, change currency</span>
              </a>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <p className="flex h-10 items-center justify-center bg-sky-600 px-4 text-sm font-medium text-white sm:px-6 lg:px-8">
        Get free delivery on orders over ₹1000
      </p>

      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
        <nav aria-label="Top" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative rounded-md bg-white p-2 text-gray-400 lg:hidden"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open menu</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>

              {/* Logo */}
              <div className="ml-3  flex lg:ml-0">
                <a href="/" className="group block h-16 w-29 rounded-3xl overflow-hidden ">
                  <span className="sr-only">Shopso</span>
                  <video
                    src="/download_20260114_233647_0000.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-contain scale-[2.7] origin-center"
                  />
                </a>
              </div>

              {/* Flyout menus */}
              <PopoverGroup className="hidden lg:ml-8 lg:block lg:self-stretch">
                <div className="flex h-full space-x-8">
                  {navigation.categories.map((category) => (
                    <Popover key={category.name} className="flex">
                      {({ open, close }) => (
                        <div onMouseLeave={() => open && close()} className="flex">
                          <div className="relative flex">
                            <PopoverButton className="group relative flex items-center justify-center text-sm font-medium text-gray-700 transition-colors duration-200 ease-out hover:text-gray-800 data-open:text-sky-600">
                              {category.name}
                              <span
                                aria-hidden="true"
                                className="absolute inset-x-0 -bottom-px z-30 h-0.5 transition duration-200 ease-out group-data-open:bg-sky-600"
                              />
                            </PopoverButton>
                          </div>
                          <PopoverPanel
                            transition
                            className="absolute inset-x-0 top-full z-20 w-full bg-white text-sm text-gray-500 transition data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
                          >
                            {/* Presentational element used to render the bottom shadow, if we put the shadow on the actual panel it pokes out the top, so we use this shorter element to hide the top of the shadow */}
                            <div aria-hidden="true" className="absolute inset-0 top-1/2 bg-white shadow-sm" />
                            <div className="relative bg-white">
                              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-16">
                                  <div className="col-start-2 grid grid-cols-2 gap-x-8">
                                    {category.featured.map((item) => (
                                      <div key={item.name} className="group relative text-base sm:text-sm">
                                        <img
                                          alt={item.imageAlt}
                                          src={item.imageSrc}
                                          className="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
                                        />
                                        <a href={item.href} className="mt-6 block font-medium text-gray-900">
                                          <span aria-hidden="true" className="absolute inset-0 z-10" />
                                          {item.name}
                                        </a>
                                        <p aria-hidden="true" className="mt-1">
                                          Shop now
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="row-start-1 grid grid-cols-3 gap-x-8 gap-y-10 text-sm">
                                    {category.sections.map((section) => (
                                      <div key={section.name}>
                                        <p id={`${section.name}-heading`} className="font-medium text-gray-900">
                                          {section.name}
                                        </p>
                                        <ul
                                          role="list"
                                          aria-labelledby={`${section.name}-heading`}
                                          className="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
                                        >
                                          {section.items.map((item) => (
                                            <li key={item.name} className="flex">
                                              <a href={item.href} className="hover:text-gray-800">
                                                {item.name}
                                              </a>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </PopoverPanel>
                        </div>
                      )}
                    </Popover>
                  ))}
                  {navigation.pages.map((page) => (
                    <a
                      key={page.name}
                      href={page.href}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                      {page.name}
                    </a>
                  ))}
                </div>
              </PopoverGroup>

              <div className="ml-auto flex items-center">
                <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">

                  {!user ? (
                    <>
                      {/* Sign In Dropdown */}
                      <div className="relative group">
                        <button className="text-sm font-medium text-gray-700 hover:text-sky-600 transition">
                          Sign in
                        </button>
                        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                          <a href="/user/login" className="block px-4 py-2 hover:bg-sky-50">
                            User Login
                          </a>
                          <a href="/vendor/login" className="block px-4 py-2 hover:bg-sky-50">
                            Vendor Login
                          </a>
                        </div>
                      </div>

                      <span className="h-6 w-px bg-gray-200" />

                      {/* Signup Dropdown */}
                      <div className="relative group">
                        <button className="text-sm font-medium text-gray-700 hover:text-sky-600 transition">
                          Create account
                        </button>
                        <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                          <a href="/user/signup" className="block px-4 py-2 hover:bg-sky-50">
                            User Signup
                          </a>
                          <a href="/vendor/signup" className="block px-4 py-2 hover:bg-sky-50">
                            Vendor Signup
                          </a>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* USER PROFILE DROPDOWN */
                    <div className="relative group">
                      <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-sky-600">
                        👤 {user.profile?.name || user.user_metadata?.username || user.user_metadata?.name || "Account"}
                      </button>

                      <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        <a href="/profile" className="block px-4 py-2 hover:bg-sky-50">
                          My Profile
                        </a>
                        <a href="/orders" className="block px-4 py-2 hover:bg-sky-50">
                          Orders
                        </a>
                        <button
                          onClick={async () => {
                            try {
                              await supabase.auth.signOut();
                              localStorage.removeItem("user");
                              localStorage.removeItem("vendor");
                              window.dispatchEvent(new Event("user-session-change"));
                              window.location.href = "/";
                            } catch (err) {
                              console.error("Logout error:", err);
                              // Fallback cleanup if signOut fails
                              localStorage.removeItem("user");
                              window.location.href = "/";
                            }
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}

                </div>


                <div className="hidden lg:ml-8 lg:flex">
                  <a href="#" className="flex items-center text-gray-700 hover:text-gray-800">
                    <span className="text-lg">🇮🇳</span>
                    <span className="ml-3 block text-sm font-medium">INR</span>
                    <span className="sr-only">, change currency</span>
                  </a>
                </div>

                {/* Search */}
                <div className="flex lg:ml-6 items-center">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      className="w-full sm:w-48 md:w-60 pl-3 pr-10 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm transition-all text-gray-800 placeholder-gray-400 bg-gray-50 hover:bg-white"
                    />
                    <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white glass-blue rounded-full transition-colors mr-1">
                      <span className="sr-only">Search</span>
                      <MagnifyingGlassIcon aria-hidden="true" className="size-5" />
                    </button>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                        <ul>
                          {suggestions.map((item, index) => (
                            <li
                              key={index}
                              onClick={() => handleSuggestionClick(item)}
                              className="px-4 py-2 hover:bg-sky-50 cursor-pointer text-sm text-gray-700 flex items-center gap-2 border-b last:border-0 border-gray-50"
                            >
                              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                              <span className="truncate">{item.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </form>
                </div>

                {/* Cart */}
                <div className="ml-4 flow-root lg:ml-6">
                  <a href="/cart" className="group -m-2 flex items-center p-2 relative">
                    <ShoppingBagIcon
                      aria-hidden="true"
                      className="size-6 shrink-0 text-gray-400 group-hover:text-sky-600 transition-colors duration-200"
                    />

                    {/* Dynamic Cart Count */}
                    <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-sky-600 transition-colors duration-200">
                      {cartCount}
                    </span>
                    <span className="sr-only">items in cart, view bag</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  )
}
