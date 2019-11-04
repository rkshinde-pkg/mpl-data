module.exports = {
  apps: [
    {
      name: "website",
      script: "server.js",

      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/

      instances: 0,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      output: "/dev/null",
      error: "/dev/null",
      env: {
        NODE_ENV: "production"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
};
