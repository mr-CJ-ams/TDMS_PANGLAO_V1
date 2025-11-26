module.exports = {
  setup: function(context, ee, next) {
    console.log("🚀 Load test setup starting...");
    
    // Generate test user IDs (1-1000)
    context.vars.testUserIds = Array.from({ length: 1000 }, (_, i) => i + 1);
    
    console.log("✅ Setup complete. Ready to test with 1000 users.");
    next();
  },

  teardown: function(context, ee, next) {
    console.log("🏁 Load test teardown - test completed!");
    next();
  },

  // Hook before each request to log progress
  beforeRequest: function(requestParams, context, ee, next) {
    // Optional: Add custom headers or logging
    next();
  },

  // Hook after each request to capture metrics
  afterResponse: function(requestParams, response, context, ee, next) {
    const statusCode = response.statusCode;
    
    // Log errors for debugging
    if (statusCode >= 400) {
      console.error(`❌ Request failed: ${requestParams.method} ${requestParams.url} - Status: ${statusCode}`);
    }
    
    next();
  }
};