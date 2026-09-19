const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: { baseURL:"http://127.0.0.1:3000", channel:"chrome", trace:"retain-on-failure" },
  webServer: {
    command:"npm start",
    url:"http://127.0.0.1:3000",
    reuseExistingServer:true,
    timeout:120_000,
    env:{ ...process.env, BROWSER:"none", HOST:"127.0.0.1", PORT:"3000" },
  },
});
