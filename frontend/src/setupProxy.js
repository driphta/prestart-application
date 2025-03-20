const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('Setting up proxy middleware for API requests');
  
  // Configure the proxy middleware for API requests
  const apiProxy = createProxyMiddleware({
    target: 'https://prestart-api1.azurewebsites.net',
    changeOrigin: true,
    secure: false,
    logLevel: 'debug',
    pathRewrite: {
      '^/api': '/api' // path rewriting (if needed)
    },
    onProxyReq: (proxyReq, req, res) => {
      // Log the proxy request
      console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      // Log the proxy response
      console.log(`[Proxy] Response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
    },
    onError: (err, req, res) => {
      // Handle proxy errors
      console.error('[Proxy] Error:', err);
      res.writeHead(500, {
        'Content-Type': 'application/json',
      });
      res.end(JSON.stringify({ 
        message: 'Proxy Error',
        error: err.message,
        code: err.code
      }));
    }
  });
  
  // Apply the proxy middleware to API routes
  app.use('/api', apiProxy);
  
  console.log('Proxy middleware setup complete');
};
