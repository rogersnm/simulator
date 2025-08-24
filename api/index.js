const { createRequestHandler } = require("@remix-run/node");

let build;
try {
  build = require("../build/index.js");
} catch (error) {
  console.error("Failed to load build:", error);
  throw error;
}

module.exports = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
});
