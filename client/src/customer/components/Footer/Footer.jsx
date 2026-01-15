import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8 mt-20">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Company Info */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
                            E-Shop
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                            Your premium destination for fashion and lifestyle products.
                            Quality meets style in every collection we curate.
                        </p>
                        <div className="flex gap-4">
                            {['twitter', 'facebook', 'instagram', 'youtube'].map((social) => (
                                <a
                                    key={social}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-sky-600 transition-colors duration-300"
                                >
                                    <span className="sr-only">{social}</span>
                                    <div className="w-5 h-5 bg-gray-400 hover:bg-white" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-sky-400">Quick Links</h4>
                        <ul className="space-y-4">
                            {['About Us', 'Contact Us', 'Our Blog', 'Careers', 'Sitemap'].map((link) => (
                                <li key={link}>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-sky-400">Support</h4>
                        <ul className="space-y-4">
                            {['Payment Methods', 'Shipping & Delivery', 'Returns & Exchanges', 'Privacy Policy', 'Terms of Service'].map((link) => (
                                <li key={link}>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-lg font-semibold mb-6 text-sky-400">Stay Updated</h4>
                        <p className="text-gray-400 mb-6">Subscribe to our newsletter for exclusive offers and updates.</p>
                        <form className="space-y-4">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-sky-500 text-white placeholder-gray-500 transition-colors"
                            />
                            <button className="w-full px-4 py-3 glass-blue rounded-lg font-semibold transition-all">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} E-Shop. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <span className="text-gray-500 text-sm hover:text-white cursor-pointer">Privacy</span>
                        <span className="text-gray-500 text-sm hover:text-white cursor-pointer">Terms</span>
                        <span className="text-gray-500 text-sm hover:text-white cursor-pointer">Cookies</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
