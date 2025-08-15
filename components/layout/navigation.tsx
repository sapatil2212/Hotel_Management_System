"use client"

<<<<<<< HEAD
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
=======
import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/ui/container"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Menu, Moon, Sun, Phone, Mail } from "lucide-react"
import { useTheme } from "next-themes"
import { QuickBanner } from "./quick-banner"
import { useHotel } from "@/contexts/hotel-context"

const Navigation = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { hotelInfo } = useHotel()
  
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/rooms", label: "Rooms" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  const services = [
    { name: "Spa & Wellness", href: "/services#spa" },
    { name: "Fine Dining", href: "/services#dining" },
    { name: "Conference Hall", href: "/services#events" },
    { name: "Pool & Fitness", href: "/services#fitness" },
  ]
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397

  return (
    <>
      {/* Quick Banner with Contact Info and Promo Offers */}
      <QuickBanner />

      {/* Main Navigation */}
<<<<<<< HEAD
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
=======
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <Container>
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              {hotelInfo.logo ? (
                <img 
                  src={hotelInfo.logo} 
                  alt={hotelInfo.name || "Hotel Logo"} 
                  className="h-8 w-auto object-contain"
                />
              ) : null}
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      pathname === "/" && "bg-accent text-accent-foreground"
                    )}>
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link href="/rooms" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      pathname === "/rooms" && "bg-accent text-accent-foreground"
                    )}>
                      Rooms
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {services.map((service) => (
                        <li key={service.name}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={service.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">{service.name}</div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/about" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      pathname === "/about" && "bg-accent text-accent-foreground"
                    )}>
                      About
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link href="/contact" legacyBehavior passHref>
                    <NavigationMenuLink className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      pathname === "/contact" && "bg-accent text-accent-foreground"
                    )}>
                      Contact
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="h-8 w-8 px-0"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              
              <Button size="sm" className="hidden md:inline-flex bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                Book Now
              </Button>

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden h-8 w-8 px-0">
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <nav className="flex flex-col gap-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "block px-2 py-1 text-lg transition-colors hover:text-foreground/80",
                          pathname === item.href ? "text-foreground" : "text-foreground/60"
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <Button className="mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                      Book Now
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </Container>
      </header>
    </>
  )
}

export default Navigation
>>>>>>> 2bfb5ac0ecad7768c2a0e781c04f1c79a6db8397
