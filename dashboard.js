 
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
 
async function getFollow(st,start,end) {
    let query = `select 
    distinct a.*,
    convert(
      varchar(10), 
      a.m_tanggal, 
      103
    ) as tanggal_ticket, 
    b.m_nama as requestby, 
    c.m_departemen as nmdiv, 
    f.m_nama as requestby, 
    m.m_unit, 
    d.m_divisi as nmsubdiv, 
    k.m_divisi as nmsubdiv_new, 
    j.m_departemen as nmdiv_new, 
    convert(
      varchar(10), 
      a.m_tanggal, 
      103
    ) as co_tanggal, 
    convert(
      varchar(10), 
      a.m_duedate, 
      103
    ) as co_duedate, 
    convert(
      varchar(10), 
      a.m_startdate, 
      103
    ) as co_startdate, 
    convert(
      varchar(10), 
      a.m_enddate, 
      103
    ) as co_enddate, 
    convert(
      varchar(10), 
      a.m_closedate, 
      103
    ) as co_closedate, 
    convert(
      varchar(10), 
      a.m_startdate, 
      103
    ) as co_responsedate, 
    convert(
      varchar(8), 
      a.m_startdate, 
      108
    ) as co_responsetime 
  from 
    t_task_new a 
    left join dbhrd.dbo.mskaryawan f on a.m_requestby COLLATE DATABASE_DEFAULT = f.m_nik COLLATE DATABASE_DEFAULT 
    left join dbhrd.dbo.mskaryawan b on a.m_requestby COLLATE DATABASE_DEFAULT = b.m_nik COLLATE DATABASE_DEFAULT 
    left join dbhrd.dbo.msdepartemen c on f.m_departemen = c.m_iddept 
    left join dbhrd.dbo.msdivisi d on f.m_divisi = d.m_iddivisi 
    left join dbhrd.dbo.msdepartemen j on a.m_divisi = j.m_iddept 
    left join dbhrd.dbo.msdivisi k on a.m_departemen = k.m_iddivisi 
    left join msunitsupport m on m.m_kodeunit = a.m_kodeunit
    left join t_task_pic_new n on n.m_nomor = a.m_nomor
    left join t_task_pic_detail o on o.m_nomor = n.m_kode 
        
    
        `
    if(start?.length>0&&end.length>0){
    query = query+` where ( a.m_tanggal >= '${start}' and a.m_tanggal <= '${end}' )`
    }
    if(start?.length>0&&end.length>0&&st?.length>0){
    query = query+` and a.m_status = '${st}'`
    }else if(st?.length>0){
      query = query+` where a.m_status = '${st}'`
    }
    try{
        let pool = await sql.connect(configTICKET);
        let login = await pool.request().query(query);
        return  {data:login.recordsets  };
    }catch(error){
        console.log({error})
    }
}
async function getDataEntry(user,start,end,dep,div,sub,st) {
  let query = `select 
	a.m_nomor as nomor_ticket, 
	convert(
	  varchar(10), 
	  a.m_tanggal, 
	  103
	) as tanggal_ticket, 
	d.m_departemen as divisi, 
	e.m_subdivisi as departemen, 
	c.m_nama as requestby, 
	i.m_unit as unit_support, 
	a.m_kode2 as lokasi, 
	a.m_kode as kode_toko,
	convert(
	  varchar(10), 
	  a.m_confirmdate, 
	  103
	) as tanggal_response, 
	convert(
	  varchar(10), 
	  a.m_donedate, 
	  103
	) as tanggal_selesai, 
	convert(
	  varchar(10), 
	  a.m_approvedate, 
	  103
	) as tanggal_approve, 
	a.m_status as status, 
	e.m_divisi as nmsubdiv_new, 
	d.m_departemen as nmdiv_new, 
	d.m_departemen as nmdiv, 
	f.m_divisi as nmsubdiv 
  from 
	t_task_new a
	left join dbhrd.dbo.mskaryawan c on a.m_requestby COLLATE DATABASE_DEFAULT = c.m_nik COLLATE DATABASE_DEFAULT 
	left join dbhrd.dbo.msdepartemen d on c.m_departemen = d.m_iddept 
	left join dbhrd.dbo.mssubdivisinew e on c.m_subdivisinew = e.m_idsubdiv 
	left join dbhrd.dbo.msdivisi f on c.m_divisi = f.m_iddivisi 
	left join msunitsupport i on i.m_kodeunit = a.m_kodeunit 
	left join dbhrd.dbo.mssubdivisi j on c.m_subdivisi = j.m_idsubdiv 
			where a.m_tanggal between '${start}' and '${end}'
            
   `
   let subNew 
   if(sub == '46'){
		subNew = 'FC';
	}else if(sub == '48'){
		subNew = 'MM';
	}else if(sub == '49'){
		subNew = 'MD';
	}else if(sub == '47'){
		subNew = 'TP';
	}else{
		subNew = sub;
	}
	
	if(dep  === "ALL" || dep===''){
		query  = query;
	}else{
		query  =query+ ` and d.m_iddept = '${dep}'`;
	}

	if(sub === "ALL" || sub==='' ){
		query = query;
	}else{
		query = query+` and a.m_kode2 = '${subNew}'`;
	}

	if(div === "ALL" || div ===''){
		query = query;
	}else{
		query = query+` and f.m_iddivisi = '${div}'`;
	}

	if(user?.groupuser  == 'IT' ||user?.groupuser == 'DIR' || user?.groupuser == 'BUSDEV' || user?.groupuser == 'AM' || user?.groupuser == 'SM'  ){
		query = query;
	}else{
		query = query+` and a.m_requestby = '${user?.nik}'`;
	}
  if (st === 'ALL' || st ===''){
		query = query;
	}
	else{
		query = query+` and a.m_status = '${st}' `;
	}
	query = query+` order by case	when a.m_status = 'REQUEST' then '00' when a.m_status = 'DOING' then '01'	when a.m_status = 'DONE' then '02' end asc, a.m_enddate asc`;
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      return  {data:login.recordsets,user,start,end,dep,div,sub,st,query  };
  }catch(error){
      console.log({error})
  }
}
module.exports = {
    getFollow,
    getMonitoring,
    getDataToDoList,
    getDataEntry 
    
}