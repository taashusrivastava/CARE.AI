const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  devServer: {
    port: 3000,
    proxy: {
      "/api": {
        target: process.env.REACT_APP_BACKEND_URL || "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
};

