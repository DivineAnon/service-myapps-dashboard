var configINFO = require('./dbinfo');
var configTICKET = require('./dbticket');
var configCMK = require('./dbcmk');
var configHRD = require('./dbhrd');
const  sql = require('mssql');
const { json } = require('body-parser');

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
    const date = new Date();
    const tgl1 = date.setMonth(-1);
    try{
        let pool = await sql.connect(configHRD);
        let login = await pool.request().input('userlogin', sql.VarChar, userlogin).input('date1', sql.DateTime, tgl1).input('date2', sql.DateTime, date).query("exec sp_absensi @userlogin @date1 @date2");
        return  login.recordsets;
    }catch(error){
        console.log(error);
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

module.exports = {
    getDataHelloGoodBye,
    getDataHBD,
    getDataAbsensi,
    getDataStoreOpen
}