var configINFO = require('./dbinfo');
var configTICKET = require('./dbticket');
var configCMK = require('./dbcmk');
var configHRD = require('./dbhrd');
const  sql = require('mssql');
const { json } = require('body-parser');
var  moment = require('moment');
async function getDataHelloGoodBye() {
    try{
        let pool = await sql.connect(configCMK);
        let login = await pool.request().query("exec api_hellogoodbye");
        return  login.recordsets;
    }catch(error){
        console.log(error);
    }
}

async function getDataAbsensi(userlogin) {
    const dates = new Date();
    // const tgl1 = date.setMonth(-1);
    const date = moment(new Date()).format('YYYY-MM-DD');
    const tgl1 = moment(dates.setMonth(-1)).format('YYYY-MM-DD');
    //  return {date,tgl1}
    try{
        let pool = await sql.connect(configHRD);
        //2021-02-13
        let login = await pool.request().input('userlogin', sql.VarChar, userlogin).input('date1', sql.Date, tgl1).input('date2', sql.Date, date).query("exec sp_absensi @userlogin, @date1, @date2");
        return  login.recordsets;
    }catch(error){
        return {error,date,tgl1}
    }
}

async function getDataHBD(userlogin) {
    try{
        let pool = await sql.connect(configHRD);
        let login = await pool.request().input('userlogin', sql.VarChar, userlogin).query("select y.m_nama, CONVERT(varchar(6), y.tgllhr, 100) as cotgl from	( select	a.m_cabang, a.m_nik, a.m_departemen, a.m_divisi, a.m_subdivisi, a.m_golkar, a.m_golongan, a.m_jabatan, a.m_atasan1, a.m_atasan2, a.m_kode_level, a.m_kode_pangkat from	dbhrd.dbo.mskaryawan a where	a.m_nik = @userlogin) x, (select * from (select top 20000 a.m_cabang, a.m_nik, a.m_nama, b.m_tgllahir, CONVERT(DATE, CONVERT(varchar(4),YEAR(GETDATE()))+'-'+CONVERT(varchar(5),b.m_tgllahir,110),120) as tgllhr, a.m_departemen, a.m_divisi, a.m_subdivisi, a.m_golkar, a.m_golongan, a.m_jabatan, a.m_atasan1, a.m_atasan2, a.m_kode_level, a.m_kode_pangkat, CAST(DATEDIFF(dd, GETDATE(), CONVERT(DATE, CONVERT(varchar(4),YEAR(GETDATE()))+'-'+CONVERT(varchar(5),b.m_tgllahir,110),120)) AS varchar) as hari from	dbhrd.dbo.mskaryawan a, dbhrd.dbo.msdetilkaryawan b where	( a.m_tglkeluar IS NULL or a.m_tglkeluar = '1900-01-01 00:00:00.000' ) and a.m_nik = b.m_nik and a.m_nik <> @userlogin and m_tgllahir <> '1900-01-01 00:00:00.000') xx where hari >= '0' and hari <= '2') y where	x.m_nik = y.m_atasan1 or x.m_nik = y.m_atasan2 or x.m_atasan1 = y.m_nik or x.m_atasan2 = y.m_nik or ( x.m_divisi <> '' and x.m_cabang = y.m_cabang and x.m_departemen = y.m_departemen and x.m_divisi = y.m_divisi ) or ( x.m_divisi = '' and x.m_cabang = y.m_cabang and x.m_departemen = y.m_departemen ) or ( x.m_cabang = y.m_cabang and x.m_golkar <= 'B2' and y.m_golkar <= 'B2' and y.m_golkar <> '' ) order by y.tgllhr asc");
        return  login.recordsets;
    }catch(error){
        console.log(error);
    }
}

async function getDataStoreOpen(userlogin) {
    try{
        let pool = await sql.connect(configCMK);
        let login = await pool.request().input('userlogin', sql.VarChar, userlogin).query("select m_brand, m_kode, m_mall, convert(varchar(10), m_start_date,103) as tglopen from msstore_new where m_status = 'A' AND m_update = '1' order by m_kode asc");
        return  login.recordsets;
    }catch(error){
        console.log(error);
    }
}
async function getDataToDoList(userlogin) {
    try{
        let pool = await sql.connect(configTICKET);
        let login = await pool.request().query(`select t.m_nomor as nomor,t.m_task as 'task',t.m_tanggal as 'tgl', t.m_kode as toko,t.m_duedate as duedate,t.m_status  from t_task as t where t.m_user=${userlogin} order by t.m_nomor asc`);
        return  login.recordsets;
    }catch(error){
        console.log(error);
    }
}
async function getMonitoring(userlogin) {
    try{
        let pool = await sql.connect(configTICKET);
        let login = await pool.request().query(`select t.m_kode,t.m_task, t.m_tgl_pekerjaan, t.m_doing_time,t.m_selesai_pic from t_task_pic as t order by t.m_kode asc`);
        return  login.recordsets;
    }catch(error){
        console.log(error);
    }
}
//todoliost db db_tiketing table t_task where user id
//monitoring db db_tiketing table t_task join t_task_pic where user id detail
//DINAS pending

module.exports = {
    getDataHelloGoodBye,
    getDataHBD,
    getMonitoring,
    getDataToDoList,
    getDataAbsensi,
    getDataStoreOpen
}