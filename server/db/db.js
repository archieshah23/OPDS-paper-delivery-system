const mariadb=require('mariadb');
const pool=mariadb.createPool({
    host:"localhost",
    user:"root",
    password:"mariaarchie",
    database:"paper",
    port:3306,
    connectionLimit:5,
})
module.exports=pool;