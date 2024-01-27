const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:3000", // Your backend server URL
    changeOrigin: true,
  })
);

app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
