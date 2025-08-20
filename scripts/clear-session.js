// Script to clear session data and cookies
// Run this in the browser console to clear all session-related cookies

console.log('Clearing session cookies...');

// Clear all NextAuth cookies
document.cookie = "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
document.cookie = "next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
document.cookie = "next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
document.cookie = "__Secure-next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
document.cookie = "__Secure-next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
document.cookie = "__Secure-next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

// Clear any other potential session cookies
document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

// Clear localStorage and sessionStorage
localStorage.clear();
sessionStorage.clear();

console.log('Session data cleared. Please refresh the page and try logging in again.');

