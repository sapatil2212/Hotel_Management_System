// QUICK CHUNKED TOKEN CLEAR
// Run this in browser console to clear chunked session tokens

console.log("🧹 Quick chunked token clear...");

// Clear chunked session tokens (0-99)
for (let i = 0; i < 100; i++) {
  const tokenName = `next-auth.session-token.${i}`;
  const secureTokenName = `__Secure-next-auth.session-token.${i}`;
  
  // Clear with multiple paths
  ['/', '/auth', '/dashboard', '/api'].forEach(path => {
    document.cookie = `${tokenName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
    document.cookie = `${secureTokenName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
  });
}

// Clear main session tokens
['next-auth.session-token', '__Secure-next-auth.session-token'].forEach(tokenName => {
  ['/', '/auth', '/dashboard', '/api'].forEach(path => {
    document.cookie = `${tokenName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
  });
});

console.log("✅ Chunked tokens cleared!");
console.log("🔄 Reloading page...");

setTimeout(() => {
  window.location.href = '/auth/sign-in';
}, 1000);
