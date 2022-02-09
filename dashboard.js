var configINFO = require('./dbinfo');
var configTICKET = require('./dbticket');
var configCMK = require('./dbcmk');
var configHRD = require('./dbhrd');
const  sql = require('mssql');
const { json } = require('body-parser');
var  moment = require('moment');
async function getDataHelloGoodBye(decoded) {
    try{
        let pool = await sql.connect(configCMK);
        let login = await pool.request().query("exec api_hellogoodbye");
        return  login.recordsets;
    }catch(error){
        console.log({error})
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

async function getDataHBD(userLogin) {
    try{
        let pool = await sql.connect(configHRD);
        let login = await pool.request().query("SELECT a.m_nama, CONVERT(varchar(6), b.m_tgllahir, 100) as cotgl FROM mskaryawan a JOIN msdetilkaryawan b ON b.m_nik = a.m_nik WHERE DAY(b.m_tgllahir) = DAY(GETDATE()) AND MONTH(b.m_tgllahir) = MONTH(GETDATE())AND (a.m_tglkeluar = '1900-01-01' OR a.m_tglkeluar IS NULL)");
        return  login.recordsets;
    }catch(error){
        console.log({error})
    }
}

async function getDataStoreOpen() {
    try{
        let pool = await sql.connect(configCMK);
        let login = await pool.request().query("select m_brand, m_kode, m_mall, convert(varchar(10), m_start_date,103) as tglopen from msstore_new where m_status = 'A' AND m_update = '1' order by m_kode asc");
        return  login.recordsets;
    }catch(error){
        console.log({error})
    }
}
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

async function getDataAbsensiReport(nik,tglFrm,tglTo) {
    try{
        let pool = await sql.connect(configHRD);
        let dataAbsen = await pool.request().query(`exec sp_reportabsensi_all '${tglFrm}', '${tglTo}', 
        'ALL', 'ALL', 'ALL', 'nik', 'ALL', 'ALL', 'ALL',
         'ALL', '${nik}','', 'nik', ''`);
        let dataCuti = await pool.request().query(`select dbo.f_sisacuti(m_nik,year('${tglFrm}'),'${tglTo}') as co_sisacuti from mskaryawan where m_nik = '${nik}'`);
        return  {dataCuti:dataCuti.recordsets,dataAbsen:dataAbsen.recordset}
    }catch(error){
        console.log({error})
    }
}
async function getNews(tglFrm,tglTo) {
    
    try{
      
        let pool = await sql.connect(configINFO);
        // 2022-01-25T00:00:00.000Z
        let data = await pool.request().query(`select * FROM t_news where m_aktif='A' and m_tanggal1 >=  '${moment(tglFrm).format('YYYY-MM-DD')+"T00:00:00.000Z"}'  and m_tanggal1<='${moment(tglTo).format('YYYY-MM-DD')+"T00:00:00.000Z"}' order by m_tanggal1 desc`);
        return  data.recordsets
    }catch(error){
        console.log({error})
    }
} 
async function getEntryStore(limit,page,brand,city,mall,status) {
    
    let last = limit*page
    let first = last - (limit-1)
    let query = `
    select * from (select  
        msstore_new.brand_code as brand_code,
        msstore_new.brand,
        msstore_new.store_code,
        msstore_new.province,
        msstore_new.city ,
        msstore_new.m_mall as mall_code,
        msmaster.m_nama as mall,
        msstore_new.m_start_date ,  
        msstore_new.m_end_date,
        msstore_new.m_month_leased,
        msstore_new.m_size,
        msstore_new.m_rental1,
        msstore_new.m_rental2,
        msstore_new.m_rental3,
        msstore_new.m_rental4,
        msstore_new.m_rental5,
        msstore_new.m_rental6,
        msstore_new.m_monthly_base1,
        msstore_new.m_monthly_base2,
        msstore_new.m_monthly_base3,
        msstore_new.m_monthly_base4,
        msstore_new.m_monthly_base5,
        msstore_new.m_monthly_base6,
        msstore_new.m_total_per_year_rent1,
        msstore_new.m_total_per_year_rent2,
        msstore_new.m_total_per_year_rent3,
        msstore_new.m_total_per_year_rent4,
        msstore_new.m_total_per_year_rent5,
        msstore_new.m_total_per_year_rent6,
        msstore_new.m_total_rental,
        msstore_new.m_remarks,
        msstore_new.m_media_promosi,
        msstore_new.m_status ,
          
          ROW_NUMBER() OVER (ORDER BY m_kode) as row 
        
        from (select msstore_new.m_brand as brand_code, 
         msmaster.m_nama as brand,
        msstore_new.m_kode as store_code,
        msstore_new.m_province as province,
        msstore_new.m_city as city ,
        msstore_new.m_mall,
        msstore_new.m_start_date ,  
        msstore_new.m_end_date,
        msstore_new.m_month_leased,
        msstore_new.m_size,
        msstore_rental_new.m_rental1,
        msstore_rental_new.m_rental2,
        msstore_rental_new.m_rental3,
        msstore_rental_new.m_rental4,
        msstore_rental_new.m_rental5,
        msstore_rental_new.m_rental6,
        msstore_rental_new.m_monthly_base1,
        msstore_rental_new.m_monthly_base2,
        msstore_rental_new.m_monthly_base3,
        msstore_rental_new.m_monthly_base4,
        msstore_rental_new.m_monthly_base5,
        msstore_rental_new.m_monthly_base6,
        msstore_rental_new.m_total_per_year_rent1,
        msstore_rental_new.m_total_per_year_rent2,
        msstore_rental_new.m_total_per_year_rent3,
        msstore_rental_new.m_total_per_year_rent4,
        msstore_rental_new.m_total_per_year_rent5,
        msstore_rental_new.m_total_per_year_rent6,
        msstore_rental_new.m_total_rental,
        msstore_new.m_remarks,
        msstore_new.m_media_promosi,
        msstore_new.m_status 
         
        from    msstore_new 
        LEFT JOIN msstore_rental_new on msstore_rental_new.m_kode = msstore_new.m_kode  
        LEFT JOIN msmaster on msstore_new.m_brand = msmaster.m_kode where msmaster.m_type='BRAND')
        msstore_new
        LEFT JOIN msmaster on msstore_new.m_mall = msmaster.m_kode where msmaster.m_type='MALL'
        `
    let queryTotal = `select   COUNT(*) as row from   msstore_new LEFT JOIN msstore_rental_new on msstore_rental_new.m_kode = msstore_new.m_kode`
    let ask = false
    if(brand){
        query = query+` AND msstore_new.brand_code = '${brand}'`
       
        queryTotal = queryTotal+` ${ask?'AND':'WHERE'} msstore_new.m_brand = '${brand}'`
        ask = true
    }
    if(city){
        query = query+` AND msstore_new.city = '${city}'`
        queryTotal = queryTotal+` ${ask?'AND':'WHERE'} msstore_new.m_city = '${city}'`
        ask = true
    }
    if(mall){
        query = query+` AND msstore_new.m_mall = '${mall}'`
        queryTotal = queryTotal+` ${ask?'AND':'WHERE'} msstore_new.m_mall = '${mall}'`
        ask = true
    }
    if(status){
        query = query+` AND msstore_new.m_status = '${status}'`
        queryTotal = queryTotal+` ${ask?'AND':'WHERE'} msstore_new.m_status = '${status}'`
        ask = true
    }
    query = query+`) msstore_new
    WHERE msstore_new.row BETWEEN '${first}' AND '${last}'`
    try{
        let pool = await sql.connect(configCMK);
        let tot = await pool.request().query(queryTotal)
        let brand = await pool.request().query(`select m_kode, m_nama from msmaster where m_type = 'BRAND' order by m_nama asc`)
        let city = await pool.request().query(`select distinct m_city from msstore_new where (m_city is not null and m_city <> '') order by m_city asc`)
        let mall = await pool.request().query(`select m_kode, m_nama from msmaster where m_type = 'MALL' order by m_kode asc`)
        let data = await pool.request().query(query);
       
        return  {  data:data.recordsets[0],tot:tot.recordsets[0],brand:brand.recordsets[0],city:city.recordsets[0],mall:mall.recordsets[0]  };
    }catch(error){
       console.log({error})
    }
}
 
module.exports = {
    getDataHelloGoodBye,
    getDataHBD,
    getMonitoring,
    getDataToDoList,
    getDataAbsensi,
    getEntryStore,
    getDataStoreOpen,
    getNews,
    getDataAbsensiReport
}