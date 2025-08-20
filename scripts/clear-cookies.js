// Manual Cookie Clear Script for 431 Error
// Run this in your browser console when you get HTTP ERROR 431

console.log("Starting manual cookie clear...");

// Clear all cookies
function clearAllCookies() {
  const cookies = document.cookie.split(";");
  
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    // Clear with multiple path variations
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/auth`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/dashboard`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/api`;
    
    // Clear with domain variations
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=localhost`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.localhost`;
  });
  
  console.log("All cookies cleared");
}

// Clear specific NextAuth cookies including numbered ones
function clearNextAuthCookies() {
  const nextAuthCookies = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "__Secure-next-auth.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.callback-url"
  ];
  
  // Add numbered session tokens (0-99)
  for (let i = 0; i < 100; i++) {
    nextAuthCookies.push(`next-auth.session-token.${i}`);
    nextAuthCookies.push(`__Secure-next-auth.session-token.${i}`);
  }
  
  nextAuthCookies.forEach(cookieName => {
    const paths = ["/", "/auth", "/dashboard", "/api"];
    const domains = ["", "localhost", ".localhost"];
    
    paths.forEach(path => {
      domains.forEach(domain => {
        const domainPart = domain ? `; domain=${domain}` : "";
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domainPart}`;
      });
    });
  });
  
  console.log("NextAuth cookies cleared (including numbered tokens)");
}

// Clear local storage
function clearLocalStorage() {
  localStorage.clear();
  sessionStorage.clear();
  console.log("Local storage cleared");
}

// Main clear function
function emergencyClear() {
  console.log("Starting emergency clear...");
  
  clearNextAuthCookies();
  clearAllCookies();
  clearLocalStorage();
  
  console.log("Emergency clear completed!");
  console.log("Please refresh the page or navigate to /auth/sign-in");
}

// Run the clear
emergencyClear();

// Also provide individual functions for manual use
console.log("Available functions:");
console.log("- clearNextAuthCookies() - Clear only NextAuth cookies (including numbered tokens)");
console.log("- clearAllCookies() - Clear all cookies");
console.log("- clearLocalStorage() - Clear local storage");
console.log("- emergencyClear() - Run full emergency clear");
