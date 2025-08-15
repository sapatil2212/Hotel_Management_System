"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotel } from "@/contexts/hotel-context";
import { QuickBanner } from "./quick-banner";

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

  // Animation variants
  const headerVariants = {
    scrolled: {
      backgroundColor: 'rgba(249, 250, 251, 0.9)',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    },
    normal: {
      backgroundColor: 'rgba(249, 250, 251, 1)',
      backdropFilter: 'blur(0px)',
      boxShadow: '0 0px 0px 0 rgba(0, 0, 0, 0)'
    }
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    })
  };

  const mobileMenuVariants = {
    open: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    },
    closed: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <>
      {/* Quick Banner with Contact Info and Promo Offers */}
      <QuickBanner />

      {/* Main Navigation */}
      <motion.header
        initial="normal"
        animate={isScrolled ? "scrolled" : "normal"}
        variants={headerVariants}
        className="sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo - Responsive */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
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
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item, i) => (
                <motion.div
                  key={item.name}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={navItemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
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
                </motion.div>
              ))}

              {/* Phone Number Button - Desktop */}
              <motion.a
                href="tel:+918552982999"
                className="relative overflow-hidden px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full font-medium text-white text-sm tracking-wide flex items-center gap-2"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <Phone className="h-4 w-4" />
                <span className="font-medium">+91 85529 82999</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.a>
            </nav>

            {/* Mobile menu button */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 hover:text-gray-900"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                variants={mobileMenuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="md:hidden overflow-hidden rounded-xl bg-white border mx-2 mt-2 p-5 mb-5"
                style={{ maxHeight: isMenuOpen ? '500px' : '0px' }}
              >
                <motion.nav 
                  className="flex flex-col space-y-4 py-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {navigation.map((item) => (
                    <motion.div
                      key={item.name}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`text-base font-medium transition-colors duration-200 hover:text-gray-900 ${
                          isActive(item.href) ? 'text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Phone Number Button - Mobile */}
                  <motion.a
                    href="tel:+918552982999"
                    className="relative overflow-hidden px-5 py-3 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full font-medium text-white text-sm tracking-wide flex items-center gap-2 justify-center mt-4"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Phone className="h-4 w-4" />
                    <span className="font-medium">+91 85529 82999</span>
                  </motion.a>
                </motion.nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </>
  );
};

export default Navigation;