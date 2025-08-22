"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
import { useHotel } from "@/contexts/hotel-context";
import { QuickBanner } from "./quick-banner";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { hotelInfo } = useHotel();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Rooms', href: '/rooms' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Quick Banner with Contact Info and Promo Offers */}
      <QuickBanner />

      {/* Main Navigation */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-md' 
          : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo - Responsive */}
            <div className="transition-opacity duration-500">
              <Link href="/" className="flex items-center">
                {hotelInfo.logo ? (
                  <img 
                    src={hotelInfo.logo} 
                    alt={hotelInfo.name || "Hotel Logo"} 
                    className="h-12 w-auto hidden sm:block object-contain" 
                  />
                ) : (
                  <span className="text-xl font-bold text-gray-900 hidden sm:block">
                    {hotelInfo.name || "Hotel"}
                  </span>
                )}
                {hotelInfo.logo ? (
                  <img 
                    src={hotelInfo.logo} 
                    alt={hotelInfo.name || "Hotel Logo"} 
                    className="h-10 w-auto sm:hidden object-contain" 
                  />
                ) : (
                  <span className="text-lg font-bold text-gray-900 sm:hidden">
                    {hotelInfo.name || "Hotel"}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item, i) => (
                <div key={item.name} className="transition-transform duration-200 hover:scale-105">
                  <Link
                    href={item.href}
                    className={`text-sm font-medium transition-colors duration-200 hover:text-gray-900 ${
                      isActive(item.href)
                        ? 'text-gray-900 border-b-2 border-gray-900 pb-1'
                        : 'text-gray-700'
                    }`}
                  >
                    {item.name}
                  </Link>
                </div>
              ))}

              {/* Login Button - Desktop */}
              <Link href="/auth/sign-in">
                <Button size="sm" variant="outline" className="transition-all duration-200 hover:scale-105">
                  Login
                </Button>
              </Link>

              {/* Phone Number Button - Desktop */}
              <a
                href={`tel:${hotelInfo.primaryPhone || '+918552982999'}`}
                className="relative overflow-hidden px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full font-medium text-white text-sm tracking-wide flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                <Phone className="h-4 w-4" />
                <span className="font-medium">{hotelInfo.primaryPhone || '+91 85529 82999'}</span>
              </a>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden overflow-hidden rounded-xl bg-white border mx-2 mt-2 p-5 mb-5 transition-all duration-300">
              <nav className="flex flex-col space-y-4 py-4">
                {navigation.map((item) => (
                  <div key={item.name} className="transition-transform duration-200 hover:translate-x-1">
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`text-base font-medium transition-colors duration-200 hover:text-gray-900 ${
                        isActive(item.href) ? 'text-gray-900' : 'text-gray-700'
                      }`}
                    >
                      {item.name}
                    </Link>
                  </div>
                ))}
                
                {/* Login Button - Mobile */}
                <Link
                  href="/auth/sign-in"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-4"
                >
                  <Button size="sm" variant="outline" className="w-full transition-all duration-200">
                    Login
                  </Button>
                </Link>

                {/* Phone Number Button - Mobile */}
                <a
                  href={`tel:${hotelInfo.primaryPhone || '+918552982999'}`}
                  className="relative overflow-hidden px-5 py-3 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full font-medium text-white text-sm tracking-wide flex items-center gap-2 justify-center mt-4 transition-transform duration-200 hover:scale-102"
                >
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">{hotelInfo.primaryPhone || '+91 85529 82999'}</span>
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Navigation;
