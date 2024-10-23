const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "bbj31ma8tye2kagi.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "japyrxkhxpbl344q",
  password: "gngmhcfisge27qo1",
  database: "if7wmd4wg128nhwy"
});

module.exports = pool;