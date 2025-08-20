// EMERGENCY CHUNKED SESSION CLEAR
// Run this in your browser console IMMEDIATELY when you get HTTP ERROR 431

console.log("🚨 EMERGENCY CHUNKED SESSION CLEAR - Starting...");

// Function to clear a specific cookie with all possible variations
function clearCookie(name) {
  const paths = ["/", "/auth", "/dashboard", "/api", "/api/auth"];
  const domains = ["", "localhost", ".localhost", "127.0.0.1"];
  
  paths.forEach(path => {
    domains.forEach(domain => {
      const domainPart = domain ? `; domain=${domain}` : "";
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domainPart}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domainPart}; secure`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domainPart}; httponly`;
    });
  });
}

// Clear ALL chunked session tokens (0-99)
console.log("Clearing chunked session tokens...");
for (let i = 0; i < 100; i++) {
  const sessionTokenName = `next-auth.session-token.${i}`;
  const secureSessionTokenName = `__Secure-next-auth.session-token.${i}`;
  
  clearCookie(sessionTokenName);
  clearCookie(secureSessionTokenName);
}

// Clear main session tokens
console.log("Clearing main session tokens...");
const mainTokens = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.csrf-token",
  "__Secure-next-auth.csrf-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url"
];

mainTokens.forEach(tokenName => {
  clearCookie(tokenName);
});

// Clear all other cookies
console.log("Clearing all other cookies...");
const allCookies = document.cookie.split(";");
allCookies.forEach(cookie => {
  const eqPos = cookie.indexOf("=");
  const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
  
  if (name) {
    clearCookie(name);
  }
});

// Clear storage
console.log("Clearing local storage...");
localStorage.clear();
sessionStorage.clear();

// Clear indexedDB
console.log("Clearing IndexedDB...");
if (window.indexedDB) {
  indexedDB.databases().then(databases => {
    databases.forEach(db => {
      indexedDB.deleteDatabase(db.name);
    });
  });
}

// Clear service workers
console.log("Clearing service workers...");
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
    });
  });
}

console.log("✅ CHUNKED SESSION CLEAR COMPLETE!");
console.log("🔄 Reloading page in 3 seconds...");

// Force reload after clearing
setTimeout(() => {
  window.location.href = '/auth/sign-in';
}, 3000);
