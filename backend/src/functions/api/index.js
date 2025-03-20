const app = require('../../server');

module.exports = async function (context, req) {
  context.log('HTTP trigger function processed a request.');
  
  // Pass the request to the Express app
  await new Promise((resolve, reject) => {
    const res = {
      status: function(status) {
        context.res = { status };
        return this;
      },
      send: function(body) {
        context.res.body = body;
        resolve();
        return this;
      },
      json: function(body) {
        context.res.body = body;
        context.res.headers = { 'Content-Type': 'application/json' };
        resolve();
        return this;
      },
      setHeader: function(key, value) {
        context.res.headers = context.res.headers || {};
        context.res.headers[key] = value;
        return this;
      }
    };
    
    // Create a mock request object
    const mockReq = {
      ...req,
      url: '/' + (req.params.route || ''),
      method: req.method,
      headers: req.headers,
      query: req.query,
      body: req.body,
      params: {}
    };
    
    // Log the request for debugging
    context.log(`Processing ${mockReq.method} request to ${mockReq.url}`);
    
    // Handle the request with the Express app
    app(mockReq, res, (err) => {
      if (err) {
        context.log.error(`Error processing request: ${err.message}`);
        context.res = {
          status: 500,
          body: {
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'production' ? {} : err
          }
        };
        resolve();
      }
    });
  });
};
