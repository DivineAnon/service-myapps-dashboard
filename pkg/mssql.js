const sql = require('mssql')
const configCMK = require('../dbticket')

function NewMssql(){
  this.connectionPool = new sql.ConnectionPool(configCMK)
  this.connection = null
}

NewMssql.prototype.getConnection = async function(){
  this.connection = await this.connectionPool.connect()  
  return this.connection.request();
}

NewMssql.prototype.closeConnection = async function(){
  if(this.connection !== null){
    await this.connection.close()
  }
}

module.exports.NewMssql = NewMssql