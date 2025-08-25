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
  const [scrollY, setScrollY] = useState(0);
  const pathname = usePathname();
  const { hotelInfo } = useHotel();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate scroll progress (0 to 1)
  const scrollProgress = Math.min(scrollY / 100, 1);
  const isScrolled = scrollY > 10;

  // Calculate dynamic values based on scroll progress
  const borderRadius = scrollProgress * 9999; // Smooth transition to rounded-full
  const paddingX = scrollProgress * 16 + 16; // Smooth padding transition
  const paddingY = scrollProgress * 8 + 16; // Smooth padding transition
  const logoScale = 1 - (scrollProgress * 0.15); // Slight logo scale down
  const textScale = 1 - (scrollProgress * 0.1); // Slight text scale down

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Rooms', href: '/rooms' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => pathname === path;

  // Ensure hotelInfo is properly initialized
  const safeHotelInfo = hotelInfo || {};

  return (
    <>
      {/* Quick Banner with Contact Info and Promo Offers */}
      <QuickBanner />

      {/* Main Navigation */}
      <header className="sticky top-0 z-50 transition-all duration-300 ease-out">
        <div 
          className="transition-all duration-300 ease-out"
          style={{
            paddingLeft: `${paddingX}px`,
            paddingRight: `${paddingX}px`,
            paddingTop: `${paddingY / 2}px`,
            paddingBottom: `${paddingY / 2}px`,
          }}
        >
          <div 
            className="transition-all duration-300 ease-out bg-white/95 backdrop-blur-md"
            style={{
              borderRadius: `${borderRadius}px`,
              maxWidth: isScrolled ? '84rem' : '100%',
              margin: isScrolled ? '0 auto' : '0',
              boxShadow: isScrolled ? '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none',
              border: isScrolled ? '1px solid rgba(229, 231, 235, 0.5)' : 'none',
            }}
          >
            <div 
              className="flex justify-between items-center transition-all duration-300 ease-out"
              style={{
                paddingLeft: isScrolled ? '24px' : '16px',
                paddingRight: isScrolled ? '24px' : '16px',
                paddingTop: isScrolled ? '12px' : '16px',
                paddingBottom: isScrolled ? '12px' : '16px',
              }}
            >
              {/* Logo - Responsive */}
              <div className="transition-all duration-300 ease-out">
                <Link href="/" className="flex items-center">
                  {safeHotelInfo.logo ? (
                    <img 
                      src={safeHotelInfo.logo} 
                      alt={safeHotelInfo.name || "Hotel Logo"} 
                      className="object-contain transition-all duration-300 ease-out hidden sm:block"
                      style={{
                        height: `${logoScale * 48}px`,
                        width: 'auto'
                      }}
                    />
                  ) : (
                    <span 
                      className="font-bold text-gray-900 hidden sm:block transition-all duration-300 ease-out"
                      style={{
                        fontSize: `${textScale * 1.25}rem`
                      }}
                    >
                      {safeHotelInfo.name || "Hotel"}
                    </span>
                  )}
                  {safeHotelInfo.logo ? (
                    <img 
                      src={safeHotelInfo.logo} 
                      alt={safeHotelInfo.name || "Hotel Logo"} 
                      className="object-contain transition-all duration-300 ease-out sm:hidden"
                      style={{
                        height: `${logoScale * 40}px`,
                        width: 'auto'
                      }}
                    />
                  ) : (
                    <span 
                      className="font-bold text-gray-900 sm:hidden transition-all duration-300 ease-out"
                      style={{
                        fontSize: `${textScale * 1.125}rem`
                      }}
                    >
                      {safeHotelInfo.name || "Hotel"}
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

                {/* Contact and Login Section - Desktop */}
                <div className="flex items-center space-x-3">
                  {/* Phone Number Button - Desktop */}
                  <a
                    href={`tel:${safeHotelInfo.primaryPhone || '+918552982999'}`}
                    className="relative overflow-hidden font-medium text-white text-sm tracking-wide flex items-center gap-2 transition-all duration-300 hover:scale-105 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full px-4 py-2"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">{safeHotelInfo.primaryPhone || '+91 85529 82999'}</span>
                  </a>

                  {/* Login Button - Desktop */}
                  <Link href="/auth/sign-in">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="transition-all duration-300 hover:scale-105 text-sm"
                    >
                      Login
                    </Button>
                  </Link>
                </div>
              </nav>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation - Outside the rounded container */}
          {isMenuOpen && (
            <div 
              className="md:hidden overflow-hidden bg-white border transition-all duration-300 rounded-xl p-4 mt-2"
              style={{
                marginLeft: '16px',
                marginRight: '16px',
                marginBottom: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
            >
              <nav className="py-2">
                {/* Navigation Links - Compact Layout */}
                <div className="space-y-1 mb-4">
                  {navigation.map((item) => (
                    <div key={item.name} className="transition-transform duration-200 hover:scale-105">
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-50 ${
                          isActive(item.href) ? 'text-gray-900 bg-gray-100' : 'text-gray-700'
                        }`}
                      >
                        {item.name}
                      </Link>
                    </div>
                  ))}
                </div>
                
                {/* Action Buttons - Side by Side */}
                <div className="flex gap-3">
                  {/* Login Button - Mobile */}
                  <Link
                    href="/auth/sign-in"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1"
                  >
                    <Button size="sm" variant="outline" className="w-full transition-all duration-200">
                      Login
                    </Button>
                  </Link>

                  {/* Phone Number Button - Mobile */}
                  <a
                    href={`tel:${safeHotelInfo.primaryPhone || '+918552982999'}`}
                    className="flex-1 relative overflow-hidden px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-700 rounded-lg font-medium text-white text-sm tracking-wide flex items-center gap-2 justify-center transition-transform duration-200 hover:scale-105"
                  >
                    <Phone className="h-4 w-4" />
                    <span className="font-medium text-xs">Call</span>
                  </a>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Navigation;
