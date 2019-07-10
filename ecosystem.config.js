
module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [

    // First application
    {
      name: 'mysql-partitions-proxy',
      script: 'index.js',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // 上线要在这里设置环境变量
      env_production: {
        RUNTIME_ENVIRONMENT: "PROD"
      },
      env_development: {
        RUNTIME_ENVIRONMENT: "DEV"
      },

    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy: {
    production: {
      user: 'work',
      host: [
        'xxx.xxx.xxx.xxx',
      ],

      ref: 'origin/xxxx',
      repo: 'git@xxx:xxx',
      path: path,
      'post-deploy': 'git pull && npm install &&  pm2 reload ecosystem.config.js --env production',

    },
    development: {
      user: 'work',
      host: [
        'xxx.xxx.xxx.xxx'
      ],
      ref: 'origin/xxx',
      repo: repo,
      path: path,
      'post-deploy': 'git pull && npm install &&  pm2 reload ecosystem.config.js --env development',

    }
  }
};
