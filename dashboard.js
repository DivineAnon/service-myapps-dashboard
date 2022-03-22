 
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
async function getSelesaiFollowUp(m_number) {
  try{
      let pool = await sql.connect(configTICKET);
      let selesai = await pool.request().query(`select COUNT(m_nomor) as selesai from t_task_pic_new where m_nomor='${m_number}' and m_done_time<>'1900-01-01 00:00:00'`);
      let all = await pool.request().query(`select COUNT(m_nomor) as semua from t_task_pic_new where m_nomor='${m_number}'`);
      let pers = Math.ceil((selesai?.recordsets[0][0]['selesai']*100)/all?.recordsets[0][0]['semua'])
      return  {
        selesai:selesai?.recordsets[0][0]['selesai'],
      all:all?.recordsets[0][0]['semua'],
      pers
    };
  }catch(error){
      console.log({error})
  }
}

async function getFollow(st,start,end,lokasi,city,unit,search,limit,page) {
  let last = limit*page
  let first = last - (limit-1)
    let query = `select*from(select   ROW_NUMBER() OVER 
    (ORDER BY m_tanggal desc) as row,* from(select 
	
      distinct a.*, 
      convert(
        varchar(10), 
        a.m_tanggal, 
        103
      ) as tanggal_ticket, 
      b.m_nama as requestby_karyawan, 
      
      c.m_departemen as nmdiv, 
      f.m_nama as requestby_divisi, 
      m.m_unit, 
      d.m_divisi as nmsubdiv, 
      k.m_divisi as nmsubdiv_new, 
      j.m_departemen as nmdiv_new, 
	  awek.selesai,
	  wew.semua,
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
      left join (select m_nomor, COUNT(m_nomor) as selesai from t_task_pic_new where  m_done_time<>'1900-01-01 00:00:00' group by m_nomor) awek on awek.m_nomor = a.m_nomor
      left join (select m_nomor,COUNT(m_nomor) as semua from t_task_pic_new group by m_nomor) wew on wew.m_nomor = a.m_nomor
    ) as arrays) as r
    
        `
    let queryTotal = `select  count(*) as tot
     from(select    ROW_NUMBER() OVER (ORDER BY  m_tanggal desc) as row,*   from(select 
	
      distinct a.*, 
      convert(
        varchar(10), 
        a.m_tanggal, 
        103
      ) as tanggal_ticket, 
      b.m_nama as requestby_karyawan, 
      
      c.m_departemen as nmdiv, 
      f.m_nama as requestby_divisi, 
      m.m_unit, 
      d.m_divisi as nmsubdiv, 
      k.m_divisi as nmsubdiv_new, 
      j.m_departemen as nmdiv_new, 
      awek.selesai,
      wew.semua,
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
      left join (select m_nomor, COUNT(m_nomor) as selesai from t_task_pic_new where  m_done_time<>'1900-01-01 00:00:00' group by m_nomor) awek on awek.m_nomor = a.m_nomor
      left join (select m_nomor,COUNT(m_nomor) as semua from t_task_pic_new group by m_nomor) wew on wew.m_nomor = a.m_nomor
    ) as arrays) as r`
    let isWhere = false
    if(start?.length>0&&end.length>0){
      
    query = query+` where (  m_tanggal >= '${start}' and  m_tanggal <= '${end}' )`
    queryTotal = queryTotal+` where (  m_tanggal >= '${start}' and  m_tanggal <= '${end}' )`
    isWhere = true
    }
    if(start?.length>0&&end.length>0&&st?.length>0){
    query = query+` ${isWhere?'and':'where'}  m_status = '${st}'`
    queryTotal = queryTotal+` ${isWhere?'and':'where'}  m_status = '${st}'`
    isWhere = true
    } 
    if(lokasi!== ''){
      query = query+` ${isWhere?'and':'where'}  m_kode2 = '${lokasi}'`
      queryTotal = queryTotal+` ${isWhere?'and':'where'}  m_kode2 = '${lokasi}'`
       isWhere = true
    }
    if(city!== ''){
      query = query+` ${isWhere?'and':'where'}  m_kota = '${city}'`
      queryTotal = queryTotal+` ${isWhere?'and':'where'}  m_kota = '${city}'`
       isWhere = true
    }
    if(unit!== ''){
      query = query+` ${isWhere?'and':'where'}  m_kodeunit = '${unit}'`
      queryTotal = queryTotal+` ${isWhere?'and':'where'}  m_kodeunit = '${search}'`
       isWhere = true
    }
    if(search!== ''){
      query = query+` ${isWhere?'and':'where'}  m_nomor = '${search}'`
      queryTotal = queryTotal+` ${isWhere?'and':'where'}  m_nomor = '${search}'`
       isWhere = true
    }

    query = query + ` ${isWhere?'and':'where'}  row BETWEEN '${first}' AND '${last}'`

    
    
    try{
        let pool = await sql.connect(configTICKET);
        let data = await pool.request().query(query);
        let tot = await pool.request().query(queryTotal);
       
        let dataz = data?.recordsets[0]
      
        let array = []
        let color = ''
        let vAll = 0
        let vSel = 0
        
        dataz?.map((d,i)=>{
           
          vAll = d?.semua===null?1:d?.semua
          vSel = d?.selesai===null?0:d?.selesai
          
          if (d?.m_status === 'REQUEST'){
           
                color = '#eb2b10'; 
              }else if (d?.m_status === 'DOING'){ 
              
                color = '#10c6eb'; 
              }else if (d?.m_status === 'DONE'){ 
                
                color = '#31eb10';
              }else if (d?.m_status === 'APPROVE'){ 
           
                color = '#dedede';
              }else if (d?.m_status === ''){ 
                
                color = '#eb2b10';
              }else{
                
                color = '#d4e0d2';
              }
    
          array.push(
            {
              color,
              pers:Math.ceil((vSel*100)/vAll),
              tanggal_ticket:d?.tanggal_ticket,
              co_closedate:d?.co_closedate,
              co_duedate:d?.co_duedate,
              co_enddate:d?.co_enddate,
              co_responsedate:d?.co_responsedate,
              co_responsetime:d?.co_responsetime,
              co_startdate:d?.co_startdate,
              co_tanggal:d?.co_tanggal,
              m_approvedate:d?.m_approvedate,
              m_canceldate:d?.m_canceldate,
              m_closedate:d?.m_closedate,
              m_confirmdate:d?.m_confirmdate,
              m_departemen:d?.m_departemen,
              m_divisi:d?.m_divisi,
              m_donedate:d?.m_donedate,
              m_duedate:d?.m_duedate,
              m_enddate:d?.m_enddate,
              m_kode:d?.m_kode,
              m_kode2:d?.m_kode2,
              m_kodeunit:d?.m_kodeunit,
              m_kota:d?.m_kota,
              m_nomor:d?.m_nomor,
              m_requestby:d?.m_requestby,
              m_startdate:d?.m_startdate,
              m_status:d?.m_status,
              m_tanggal:d?.m_tanggal,
              m_unit:d?.m_unit,
              nmdiv:d?.nmdiv,
              nmdiv_new:d?.nmdiv_new,
              nmsubdiv:d?.nmsubdiv,
              nmsubdiv_new:d?.nmsubdiv_new,
              requestby_divisi:d?.requestby_divisi,
              requestby_karyawan:d?.requestby_karyawan,
              row:d?.row,
              tanggal_ticket:d?.tanggal_ticket,
            }
          )
              vSel = 0
              vAll = 0
              color = ''
        })
        return  {
           
          dataz,
          data:array,
          tot:tot.recordsets[0][0]['tot']
         };
    }catch(error){
        console.log({error})
    }
}
async function getDataEntry(user,start,end,dep,div,sub,st,unit,limit,page) {
  let last = limit*page
  let first = last - (limit-1)
  let query = `select * from (
    select  ROW_NUMBER() OVER (order by case
         when status = 'REQUEST' then '00' 
         when status = 'APPROVE' then '01' 
         when status = 'DOING' then '02'
        when status = 'DONE' then '03' 
           end asc, status asc) as row,* from (
    select
      a.m_nomor as nomor_ticket, 
      a.m_kode2,
      a.m_tanggal,
      a.m_requestby,
      f.m_iddivisi, 
      d.m_iddept,
      a.m_status as status, 
      i.m_kodeunit,
      convert(
        varchar(10), 
        a.m_tanggal, 
        103
      ) as tanggal_ticket, 
      d.m_departemen as divisi, 
      e.m_subdivisi as departemen, 
      e.m_idsubdiv ,
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
      ) d
      ) awek
			where m_tanggal between '${start}' and '${end}'
            
   `
   let queryTotal = `select count(*) as row from (
    select  ROW_NUMBER() OVER (order by case
         when status = 'REQUEST' then '00' 
         when status = 'APPROVE' then '01' 
         when status = 'DOING' then '02'
        when status = 'DONE' then '03' 
           end asc, status asc) as row,* from (
    select
      a.m_nomor as nomor_ticket, 
      a.m_kode2,
      a.m_tanggal,
      a.m_requestby,
      f.m_iddivisi, 
      d.m_iddept,
      a.m_status as status, 
      i.m_kodeunit,
      convert(
        varchar(10), 
        a.m_tanggal, 
        103
      ) as tanggal_ticket, 
      d.m_departemen as divisi, 
      e.m_subdivisi as departemen, 
      e.m_idsubdiv ,
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
      ) d
      ) awek
			where m_tanggal between '${start}' and '${end}'
            
   `
   if( unit!==''){
    query= query+` and  m_kodeunit = '${unit}'`
  }
 
  if( st!==''){
    query= query+` and  status = '${st}'`
  }
  if( dep!==''){
    // query= query+` and  e.m_idsubdiv = '${dep}'`
    query  =query+ ` and m_iddept = '${dep}'`;
  }
  if( div!==''){
    query = query+` and m_iddivisi = '${div}'`;
    // query= query+` and  d.m_iddept = '${div}'`
  }
  if( sub!==''){
    // query= query+` and  f.m_iddivisi = '${sub}'`
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
    query = query+` and m_kode2 = '${subNew}'`;
  }
  if(user?.groupuser  == 'IT' ||user?.groupuser == 'DIR' || user?.groupuser == 'BUSDEV' || user?.groupuser == 'AM' || user?.groupuser == 'SM'  ){
		query = query;
	}else{
		query = query+` and m_requestby = '${user?.nik}'`;
	}
        
	query = query+`and row BETWEEN '${first}' AND '${last}'`;
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(queryTotal);
      return  {
        data:data?.recordsets[0],
        // query
        row:tot?.recordsets[0][0]['row'] 
      };
  }catch(error){
      console.log({error})
  }
}


async function getKategoriSupport(unit) {
  let query = `
  select * from mskategorisupport where m_unit = '${unit}' order by m_kodekategori asc   
   ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      return  {data:login.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function getSubKategoriSupport(kategori) {
  let query = `
  select * from mssubkategorisupport where m_kodekategori = '${kategori}' order by m_kodesub asc
   ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      return  {data:login.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function getListUnit() {
  let query = `  select * from msunitsupport order by m_unit asc
            
   ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      return  {data:login.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function getExportFollowUp(start,end,unit,dep,m_nomor,store,area) {
  let query = ``
  if(unit === '04' || unit === '01'|| 
  unit === '03' || unit === '05'|| 
  unit === '06'|| unit === '07'|| unit === '08') {
    query =`select 
		a.m_nomor as nomor_ticket,
		convert(varchar(10),a.m_tanggal,103) as tanggal_ticket,
		c.m_departemen as divisi,
		d.m_divisi as departemen,
		b.m_nama as nama,
		e.m_unit as unit_support,
		a.m_kode2 as lokasi,
		a.m_kode as kode_toko,
		g.m_topic as kategori,
		'' as subkategori,
		f.m_qty as quantity,
		f.m_nofpp as no_fpp,
		convert(
		varchar(10), 
			f.m_doing_time, 
		103
		) as tanggal_response, 
		convert(
		varchar(10), 
			f.m_doing_time, 
		108
		) as jam_response, 
		convert(
		varchar(10), 
			f.m_done_time, 
		103
		) as tanggal_selesai,
		convert(
		varchar(10), 
			f.m_done_time, 
		108
		) as jam_selesai,
		convert(
		varchar(10), 
			f.m_approve_time, 
		103
		) as tanggal_approve,
		convert(
		varchar(10), 
			f.m_approve_time, 
		108
		) as jam_approve,
		convert(
		varchar(10), 
			f.m_start_pic, 
		103
		) as tanggal_set_pic,
		convert(
		varchar(10), 
			f.m_start_pic, 
		108
		) as jam_set_pic,
		f.m_kode as kode,
		f.m_status_pic
		from t_task_new a
		join dbhrd.dbo.mskaryawan b on a.m_requestby = b.m_nik
		join dbhrd.dbo.msdepartemen c on b.m_departemen = c.m_iddept
		join dbhrd.dbo.msdivisi d on b.m_divisi = d.m_iddivisi 
		join msunitsupport e on a.m_kodeunit = e.m_kodeunit 
		join t_task_pic_new f on a.m_nomor = f.m_nomor
		join mskategorisupport g on f.m_kodekategori = g.m_kodekategori 
		where (a.m_tanggal between '${start}' and '${end}' ) and a.m_kodeunit = '${unit}'`
  }else if(unit === '02'){
    query =`select 
    a.m_nomor as nomor_ticket,
    convert(varchar(10),a.m_tanggal,103) as tanggal_ticket,
    c.m_departemen as divisi,
    d.m_divisi as departemen,
    b.m_nama as nama,
    e.m_unit as unit_support,
    a.m_kode2 as lokasi,
    a.m_kode as kode_toko,
    g.m_topic as kategori,
    h.m_topic as subkategori,
    f.m_qty as quantity,
    f.m_nofpp as no_fpp,
    convert(
    varchar(10), 
      f.m_doing_time, 
    103
    ) as tanggal_response, 
    convert(
    varchar(10), 
      f.m_doing_time, 
    108
    ) as jam_response, 
    convert(
    varchar(10), 
      f.m_done_time, 
    103
    ) as tanggal_selesai,
    convert(
    varchar(10), 
      f.m_done_time, 
    108
    ) as jam_selesai,
    convert(
    varchar(10), 
      f.m_approve_time, 
    103
    ) as tanggal_approve,
    convert(
    varchar(10), 
      f.m_approve_time, 
    108
    ) as jam_approve,
    convert(
    varchar(10), 
      f.m_start_pic, 
    103
    ) as tanggal_set_pic,
    convert(
    varchar(10), 
      f.m_start_pic, 
    108
    ) as jam_set_pic,
    f.m_kode as kode,
    f.m_status_pic
    from t_task_new a
    join dbhrd.dbo.mskaryawan b on a.m_requestby = b.m_nik
    join dbhrd.dbo.msdepartemen c on b.m_departemen = c.m_iddept
    join dbhrd.dbo.msdivisi d on b.m_divisi = d.m_iddivisi 
    join msunitsupport e on a.m_kodeunit = e.m_kodeunit 
    join t_task_pic_new f on a.m_nomor = f.m_nomor
    join mskategorisupport g on f.m_kodekategori = g.m_kodekategori 
    join mssubkategorisupport h on f.m_kodesub = h.m_kodesub 	
    where (a.m_tanggal between '${start}' and '${end}' ) and a.m_kodeunit = '02'`
  }else{
    query =`select 
		a.m_nomor as nomor_ticket,
		convert(varchar(10),a.m_tanggal,103) as tanggal_ticket,
		c.m_departemen as divisi,
		d.m_divisi as departemen,
		b.m_nama as nama,
		e.m_unit as unit_support,
		a.m_kode2 as lokasi,
		a.m_kode as kode_toko,
		g.m_topic as kategori,
		h.m_topic as subkategori,
		f.m_qty as quantity,
		f.m_nofpp as no_fpp,
		convert(
		varchar(10), 
			f.m_doing_time, 
		103
		) as tanggal_response,  
		convert(
		varchar(10), 
			f.m_done_time, 
		103
		) as tanggal_selesai,
		convert(
		varchar(10), 
			f.m_approve_time, 
		103
		) as tanggal_approve,
		convert(
		varchar(10), 
			f.m_start_pic, 
		103
		) as tanggal_set_pic,
		f.m_kode as kode,
		f.m_status_pic
		from t_task_new a
		join dbhrd.dbo.mskaryawan b on a.m_requestby = b.m_nik
		join dbhrd.dbo.msdepartemen c on b.m_departemen = c.m_iddept
		join dbhrd.dbo.msdivisi d on b.m_divisi = d.m_iddivisi 
		join msunitsupport e on a.m_kodeunit = e.m_kodeunit 
		join t_task_pic_new f on a.m_nomor = f.m_nomor
		join mskategorisupport g on f.m_kodekategori = g.m_kodekategori 
		join mssubkategorisupport h on f.m_kodesub = h.m_kodesub 	
		where (a.m_tanggal between '${start}' and '${end}' )`
  }
  if (dep !== '' )
	{ 	query = query+` and case when 
  (a.m_divisi IS NOT NULL or a.m_divisi <> '' ) 
  then a.m_divisi 
   else f.m_departemen end = '${dep}' `;

  }

	if (m_nomor !== '')
	{	
    query = query+` and a.m_nomor = '${m_nomor}' `;
  
  }
  
	if (store !== '')
	{	
    query = query+` and a.m_kode2 like '%${store}%'`;
  }
  
	if (area != '')
	{	
    query = query+` and a.m_kota like '${area}'`;
  }
  
	query = query+` order by a.m_tanggal, a.m_nomor asc ` ;
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      return  {data:data.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function getExportFollowUpPIC(start,end,unit,dep,m_nomor,store,area) {
  let query = ` `
  if(unit === '04' || unit === '01'|| 
  unit === '03' || 
  unit === '05'|| 
  unit === '06'|| unit === '07'|| unit === '08'){
		query = `select 
		a.m_nomor as nomor_ticket,
		convert(varchar(10),a.m_tanggal,103) as tanggal_ticket,
		c.m_departemen as divisi,
		d.m_divisi as departemen,
		b.m_nama as nama,
		e.m_unit as unit_support,
		a.m_kode2 as lokasi,
		a.m_kode as kode_toko,
		g.m_topic as kategori,
		'' as subkategori,
		f.m_qty as quantity,
		f.m_nofpp as no_fpp,
		convert(
		varchar(10), 
			f.m_doing_time, 
		103
		) as tanggal_response, 
		convert(
		varchar(10), 
			f.m_doing_time, 
		108
		) as jam_response, 
		convert(
		varchar(10), 
			f.m_done_time, 
		103
		) as tanggal_selesai,
		convert(
		varchar(10), 
			f.m_done_time, 
		108
		) as jam_selesai,
		convert(
		varchar(10), 
			f.m_approve_time, 
		103
		) as tanggal_approve,
		convert(
		varchar(10), 
			f.m_approve_time, 
		108
		) as jam_approve,
		convert(
		varchar(10), 
			f.m_start_pic, 
		103
		) as tanggal_set_pic,
		convert(
		varchar(10), 
			f.m_start_pic, 
		108
		) as jam_set_pic,
		f.m_kode as kode,
		f.m_status_pic
		from t_task_new a
		join dbhrd.dbo.mskaryawan b on a.m_requestby = b.m_nik
		join dbhrd.dbo.msdepartemen c on b.m_departemen = c.m_iddept
		join dbhrd.dbo.msdivisi d on b.m_divisi = d.m_iddivisi 
		join msunitsupport e on a.m_kodeunit = e.m_kodeunit 
		join t_task_pic_new f on a.m_nomor = f.m_nomor
		join mskategorisupport g on f.m_kodekategori = g.m_kodekategori 
		where (a.m_tanggal between '${start}' and '${end}' ) 
    and a.m_kodeunit = '${unit}'`;
	} 
  else if(unit === '02'){
		query = `select 
			a.m_nomor as nomor_ticket,
			convert(varchar(10),a.m_tanggal,103) as tanggal_ticket,
			c.m_departemen as divisi,
			d.m_divisi as departemen,
			b.m_nama as nama,
			e.m_unit as unit_support,
			a.m_kode2 as lokasi,
			a.m_kode as kode_toko,
			g.m_topic as kategori,
			h.m_topic as subkategori,
			f.m_kode as nomor_task,
			f.m_qty as quantity,
			f.m_nofpp as no_fpp,
			convert(
			varchar(10), 
				f.m_doing_time, 
			103
			) as tanggal_response, 
			convert(
			varchar(10), 
				f.m_doing_time, 
			108
			) as jam_response, 
			convert(
			varchar(10), 
				f.m_done_time, 
			103
			) as tanggal_selesai,
			convert(
			varchar(10), 
				f.m_done_time, 
			108
			) as jam_selesai,
			convert(
			varchar(10), 
				f.m_approve_time, 
			103
			) as tanggal_approve,
			convert(
			varchar(10), 
				f.m_approve_time, 
			108
			) as jam_approve,
			convert(
			varchar(10), 
				f.m_start_pic, 
			103
			) as tanggal_set_pic,
			convert(
			varchar(10), 
				f.m_start_pic, 
			108
			) as jam_set_pic,
			f.m_kode as kode,
			f.m_status_pic,
			j.m_nama as pic
			from t_task_new a
			join dbhrd.dbo.mskaryawan b on a.m_requestby = b.m_nik
			join dbhrd.dbo.msdepartemen c on b.m_departemen = c.m_iddept
			join dbhrd.dbo.msdivisi d on b.m_divisi = d.m_iddivisi 
			join msunitsupport e on a.m_kodeunit = e.m_kodeunit 
			join t_task_pic_new f on a.m_nomor = f.m_nomor
			join mskategorisupport g on f.m_kodekategori = g.m_kodekategori 
			join mssubkategorisupport h on f.m_kodesub = h.m_kodesub 
			join t_task_pic_detail i on f.m_kode = i.m_nomor 
			join dbhrd.dbo.mskaryawan j on i.m_pic = j.m_nik	
			where (a.m_tanggal between '${start}' and '${end}' ) and a.m_kodeunit = '02'`
      }
      else{
        query = `select 
		a.m_nomor as nomor_ticket,
		convert(varchar(10),a.m_tanggal,103) as tanggal_ticket,
		c.m_departemen as divisi,
		d.m_divisi as departemen,
		b.m_nama as nama,
		e.m_unit as unit_support,
		a.m_kode2 as lokasi,
		a.m_kode as kode_toko,
		g.m_topic as kategori,
		h.m_topic as subkategori,
		f.m_qty as quantity,
		f.m_nofpp as no_fpp,
		convert(
		varchar(10), 
			f.m_doing_time, 
		103
		) as tanggal_response,  
		convert(
		varchar(10), 
			f.m_done_time, 
		103
		) as tanggal_selesai,
		convert(
		varchar(10), 
			f.m_approve_time, 
		103
		) as tanggal_approve,
		convert(
		varchar(10), 
			f.m_start_pic, 
		103
		) as tanggal_set_pic,
		f.m_kode as kode,
		f.m_status_pic 
		from t_task_new a  
		join dbhrd.dbo.mskaryawan b on a.m_requestby = b.m_nik
		join dbhrd.dbo.msdepartemen c on b.m_departemen = c.m_iddept
		join dbhrd.dbo.msdivisi d on b.m_divisi = d.m_iddivisi 
		join msunitsupport e on a.m_kodeunit = e.m_kodeunit 
		join t_task_pic_new f on a.m_nomor = f.m_nomor
		join mskategorisupport g on f.m_kodekategori = g.m_kodekategori
    join mssubkategorisupport h on f.m_kodesub = h.m_kodesub 
		where (a.m_tanggal between '${start}' and '${end}' )`
      }
      if (( dep !== '' ) )
	{ 	query= query+` and case when (a.m_divisi IS 
        NOT NULL or a.m_divisi <> '' ) then 
      a.m_divisi  else f.m_departemen end = '${dep}' `;}

	if (m_nomor !== '')
	{	query= query+` and a.m_nomor = '${m_nomor}' `;}

	if (store !== '')
	{	query= query+` and a.m_kode2 like '%${store}%'`;}

	if (area !== '')
	{	query= query+` and a.m_kota like '%${area}%'`;}

	query= query+` order by a.m_tanggal, a.m_nomor asc ` ;
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      return  {data:data?.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
module.exports = {
    getExportFollowUpPIC,
    getExportFollowUp,
    getSubKategoriSupport,
    getKategoriSupport,
    getFollow,
    getListUnit,
    getMonitoring,
    getDataToDoList,
    getDataEntry ,
    getSelesaiFollowUp
}