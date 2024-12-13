const dotenv = require("dotenv");
const mysql = require("mysql2");

// Load environment variables
dotenv.config();
const cn = `mysql://${process.env.MYSQLUSER}:${process.env.MYSQL_ROOT_PASSWORD}@${process.env.RAILWAY_PRIVATE_DOMAIN}:3306/${process.env.MYSQL_DATABASE}`
// Create a connection using environment variables
const connection = mysql.createConnection(cn);

// Establish connection
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to database");
});

module.exports = connection;
