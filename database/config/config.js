module.exports = {
  development: {
    username: 'root',
    password: 'root_password_123',
    database: 'chat_app',
    host: 'localhost',
    port: 3307,
    dialect: 'mysql',
    logging: console.log
  },
  docker: {
    username: 'root',
    password: 'root_password_123',
    database: 'chat_app',
    host: 'mysql',
    port: 3306,
    dialect: 'mysql',
    logging: console.log
  }
};
