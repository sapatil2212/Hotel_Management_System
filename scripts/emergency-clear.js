// EMERGENCY SESSION CLEAR SCRIPT
// Run this in your browser console to immediately clear all session data

console.log('🚨 EMERGENCY SESSION CLEAR - Starting...');

// Function to clear all cookies
function clearAllCookies() {
  const cookies = document.cookie.split(";");
  console.log(`Found ${cookies.length} cookies to clear`);
  
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    // Clear cookie with different path options
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/auth";
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/dashboard";
    
    console.log(`Cleared cookie: ${name}`);
  }
}

// Clear all NextAuth specific cookies
function clearNextAuthCookies() {
  const nextAuthCookies = [
    "next-auth.session-token",
    "next-auth.csrf-token", 
    "next-auth.callback-url",
    "__Secure-next-auth.session-token",
    "__Secure-next-auth.csrf-token",
    "__Secure-next-auth.callback-url",
    "session",
    "token",
    "auth"
  ];
  
  nextAuthCookies.forEach(cookieName => {
    document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/auth";
    document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/dashboard";
    console.log(`Cleared NextAuth cookie: ${cookieName}`);
  });
}

// Clear all storage
function clearAllStorage() {
  try {
    localStorage.clear();
    console.log('✅ localStorage cleared');
  } catch (e) {
    console.log('❌ Error clearing localStorage:', e);
  }
  
  try {
    sessionStorage.clear();
    console.log('✅ sessionStorage cleared');
  } catch (e) {
    console.log('❌ Error clearing sessionStorage:', e);
  }
}

// Main execution
try {
  console.log('🧹 Clearing all cookies...');
  clearAllCookies();
  
  console.log('🔐 Clearing NextAuth cookies...');
  clearNextAuthCookies();
  
  console.log('💾 Clearing storage...');
  clearAllStorage();
  
  console.log('✅ EMERGENCY CLEAR COMPLETE!');
  console.log('🔄 Please refresh the page and try again.');
  
  // Auto-refresh after 2 seconds
  setTimeout(() => {
    console.log('🔄 Auto-refreshing page...');
    window.location.reload();
  }, 2000);
  
} catch (error) {
  console.error('❌ Error during emergency clear:', error);
  console.log('🔄 Please manually refresh the page.');
}

