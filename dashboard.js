 
var configTICKET = require('./dbticket');
 
const  sql = require('mssql');
const { json } = require('body-parser');
var  moment = require('moment');
async function getDataToDoList(userlogin) {
    try{
        let pool = await sql.connect(configTICKET);
        let login = await pool.request().query(`select t.m_nomor as nomor,t.m_task as 'task',t.m_tanggal as 'tgl', t.m_kode as toko,t.m_duedate as duedate,t.m_status  from t_task as t where t.m_user=${userlogin} order by t.m_nomor asc`);
        return  login.recordsets;
    }catch(error){
        console.log({error})
    }
}
async function getMonitoring(userlogin) {
    try{
        let pool = await sql.connect(configTICKET);
        let login = await pool.request().query(`select t.m_kode,t.m_task, t.m_tgl_pekerjaan, t.m_doing_time,t.m_selesai_pic from t_task_pic as t order by t.m_kode asc`);
        return  login.recordsets;
    }catch(error){
        console.log({error})
    }
}
 
 
module.exports = {
  
    getMonitoring,
    getDataToDoList 
    
}