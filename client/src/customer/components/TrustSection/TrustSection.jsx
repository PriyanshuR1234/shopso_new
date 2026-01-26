import React from 'react';

const features = [
    {
        icon: (
            <svg className="w-8 h-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: "Online Support",
        description: "24/7 Dedicated Support"
    },
    {
        icon: (
            <svg className="w-8 h-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
            </svg>
        ),
        title: "100% Money Back",
        description: "7 Days Return Policy"
    },
    {
        icon: (
            <svg className="w-8 h-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        title: "Secure Payment",
        description: "We ensure secure payment"
    },
    {
        icon: (
            <svg className="w-8 h-8 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
            </svg>
        ),
        title: "Free Shipping",
        description: "On All Orders Over ₹999"
    },
];

const TrustSection = () => {
    return (
        <div className="py-10 bg-white/40 backdrop-blur-sm border-b border-white/60 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-4 group cursor-pointer p-4 rounded-xl hover:bg-white/60 hover:backdrop-blur-sm transition-all duration-300 hover:shadow-sm">
                            <div className="p-3 bg-sky-100/50 rounded-full group-hover:bg-sky-200/50 transition-colors backdrop-blur-sm">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                                <p className="text-sm text-gray-500">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrustSection;
