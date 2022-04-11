 
var configTICKET = require('./dbticket');
var axs = require('./axios'); 
const fs = require('fs')
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
      
    query = query+` where (  m_tanggal >= '${start} 00:00:01' and  m_tanggal <= '${end} 23:59:59' )`
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
      where m_tanggal between '${start}' and '${end}'
      
			
            
   `
   if( unit!==''){
    query= query+` and  m_kodeunit = '${unit}'`
    queryTotal = queryTotal+` and  m_kodeunit = '${unit}'`
  }
 
  if( st!==''){
    query= query+` and  status = '${st}'`
    queryTotal = queryTotal+` and  status = '${st}'`
  }
  if( dep!==''){
    // query= query+` and  e.m_idsubdiv = '${dep}'`
    query  =query+ ` and m_iddept = '${dep}'`;
    queryTotal = queryTotal+` and m_iddept = '${dep}'`;
  }
  if( div!==''){
    query = query+` and m_iddivisi = '${div}'`;
    queryTotal = queryTotal+` and m_iddivisi = '${div}'`;
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
    queryTotal = queryTotal+` and m_kode2 = '${subNew}'`;
  }
  if(user?.groupuser  == 'IT'
   ||user?.groupuser == 'DIR' 
   || user?.groupuser == 'BUSDEV' 
   || user?.groupuser == 'AM' 
   || user?.groupuser == 'SM'
   || user?.groupuser == 'GM'  ){
		query = query;
    queryTotal = queryTotal
	}else{
		query = query+` and m_requestby = '${user?.nik}'`;
    queryTotal = queryTotal+` and m_requestby = '${user?.nik}'`;
	}
  queryTotal = queryTotal+`
  ) awek
  `      
	query = query+`
  ) awek
  
  where row BETWEEN '${first}' AND '${last}'`;
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(queryTotal);
      let dataz = data?.recordsets[0]
      
        let array = []
        let color = ''
       
        
        dataz?.map((d,i)=>{
           
          
          
          if (d?.status === 'REQUEST'){
           
            color = '#eb2b10'; 
          }else if (d?.status === 'DOING'){ 
          
            color = '#10c6eb'; 
          }else if (d?.status === 'DONE'){ 
            
            color = '#31eb10';
          }else if (d?.status === 'APPROVE'){ 
        
            color = '#dedede';
          }else if (d?.status === ''){ 
            
            color = '#eb2b10';
          }else{
            
            color = '#d4e0d2';
          }
    
          array.push(
            {
              color,
              status:d?.status,
              nomor_ticket:d?.nomor_ticket,
              row:d?.row,
              m_kode2:d?.m_kode2,
              m_tanggal:d?.m_tanggal,
              m_requestby:d?.m_requestby,
              m_iddivisi:d?.m_iddivisi,
              m_iddept:d?.m_iddept,
              m_kodeunit:d?.m_kodeunit,
              tanggal_ticket:d?.tanggal_ticket,
              divisi:d?.divisi,
              departemen:d?.departemen,
              m_idsubdiv:d?.m_idsubdiv,
              requestby:d?.requestby,
              unit_support:d?.unit_support,
              lokasi:d?.lokasi,
              kode_toko:d?.kode_toko,
              tanggal_response:d?.tanggal_response,
              tanggal_selesai:d?.tanggal_selesai,
              tanggal_approve:d?.tanggal_approve,
              nmsubdiv_new:d?.nmsubdiv_new,
              nmdiv_new:d?.nmdiv_new,
              nmdiv:d?.nmdiv,
              nmsubdiv:d?.nmsubdiv
              
              
            }
          )
               
              color = ''
        })
      return  {
        // datas:data?.recordsets[0],
        data:array,
        // query,
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
async function getHistoryTiket(no) {
  let query = `  
  select 
     
    convert(
      varchar(10), 
      a.m_tglpekerjaan ,
      105
    ) as tanggal_job,
    convert(
      varchar(10), 
      a.m_tglpekerjaan ,
      108
    ) as jam_job,
  convert(
    varchar(10), 
    b.m_start_pic, 
    105
  ) as tanggal_pic,
  convert(
    varchar(10), 
    b.m_start_pic, 
    108
  ) as jam_pic,
  b.m_status_pic as status_pic,
  b.m_doing_by as doing_by,
  b.m_done_by as done_by,
  b.m_approve_by as approve_by,
  c.m_kode as store,
  c.m_requestby as requestor,
  a.m_statustask as status_task,
  
  CAST(e.m_store_location AS VARCHAR(MAX)) as stored,
  a.m_nomortask
  from  t_task_history a
left join t_task_pic_new b on a.m_nomortask = b.m_kode
left join t_task_new c on b.m_nomor = c.m_nomor 
left join t_task_new d on b.m_nomor = c.m_nomor 
left join dbcmk.dbo.msstore_new e on e.m_kode COLLATE DATABASE_DEFAULT = c.m_kode COLLATE DATABASE_DEFAULT
where a.m_nomortask = '${no}'
group by 
 b.m_status_pic ,
  b.m_doing_by  ,
  b.m_done_by  ,
  b.m_approve_by ,
  c.m_kode ,
  c.m_requestby ,
  a.m_statustask ,
  CAST(e.m_store_location AS VARCHAR(MAX)),
a.m_tglpekerjaan,
b.m_start_pic ,
a.m_nomortask
   `
let querypic = `
select a.m_nomor,a.m_pic,b.m_nama from t_task_pic_detail a
left join dbhrd.dbo.mskaryawan b on a.m_pic = b.m_nik

`
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let data2 = await pool.request().query(querypic);
      let d1 = data?.recordsets[0]
      let d2 = data2?.recordsets[0]
      let array =[]
      let array2 = []
      d1.map((d)=>{
        d2.map((e)=>{
          if(d?.m_nomortask===e?.m_nomor){
            array2.push(e.m_nama)
          }
        })
        array.push({
          nama:array2,
          status:d.status_pic,
          doing:d.doing_by,
          done:d.done_by,
          approve:d.approve_by,
          m_kode:d.store,
          request:d.requestor,
          statustask:d.status_task,
          stored:d?.stored,
          tgl_job:d?.tanggal_job,     
          jam_job:d.jam_job,
          startjam_pic:d.jam_pic,
          tgl_pic:d?.tanggal_pic,
          nomortask:d.m_nomortask
        })
        array2 = []
      })
      return  {data:array};
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
async function getGenerateEntryRequest(unit) {
  let query = `
  select max(right(m_nomor,4)) as max from t_task_new where left(m_nomor,3) = '${unit}'
  ` 
  let day = moment(new Date()).format('YYYYMMDD')
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let max = data?.recordsets[0][0]['max']
      let no = ''
      let inc = 0
      let temp = ''
      if (max === ''||max===null){
        no = '0000' ;
      }else{
        inc = parseInt(max)+1
        temp = '0000'+ inc.toString()
        no = temp.substring(temp.length-4)
      }
      let code = unit+day+no
      return  {code};
  }catch(error){
      console.log({error})
  }
}
async function insertEntryRequest(userlogin,no,unit,div,dep,store,city,lokasi) {
  let query = `
      insert into t_task_new (m_nomor, m_tanggal, 
      m_duedate, m_status, m_requestby, m_closedate, 
      m_kodeunit, m_startdate, m_enddate, m_confirmdate, 
      m_donedate, m_canceldate, m_divisi, m_departemen, 
      m_kode, m_kota, m_approvedate, m_kode2) 
			values ('${no}', '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
      '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}', 
      'REQUEST', '${userlogin}', '', '${unit}', '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}', 
       '', '', '', '', 
       '${div}', '${dep}', '${store}', '${city}', '', '${lokasi}')

  ` 
    
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      return  {data:data?.recordsets[0],userlogin,no,unit,div,dep,store,city,lokasi};
  }catch(error){
      console.log({error})
  }
}
async function updateEntryRequest(no,unit,m_kode,m_kode2,m_kota) {
  let query = `
    update 	t_task_new 
		set  m_kodeunit = '${unit}', 
    m_kode = '${m_kode}', 
    m_kota = '${m_kota}', 
    m_kode2 = '${m_kode2}'
    where 	m_nomor = '${no}'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      return  {data:login.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function insertEntryRequestList(id,
  kategori,subkategori,ket,foto_name,no,m_nomor,
  qty,fpp
  ) {
  let query = `
  insert into t_task_pic_new ( m_kode, m_kodekategori, 
  m_kodesub, m_tgl_pekerjaan, m_tgl_selesai, m_keterangan, 
  m_status_pic, m_foto1, m_foto2, m_urut, m_nomor, m_isdoing, 
  m_doing_time, m_doing_by, m_done_by, m_qty, m_approve_time, 
  m_approve_by, m_done_time, m_nofpp)
  values ('${id}', '${kategori}', '${subkategori}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}', '', 
  '${ket}', 'REQUEST', '${foto_name}', '', '${no}', '${m_nomor}',
  '0', '', '', '', '${qty}', '', '', '', '${fpp}')
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      return  {data:login.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function insertEntryRequesHistory(id 
  ) {
  let query = `
  insert into t_task_history ( m_nomortask, m_tglpekerjaan, 
  m_statustask)
  values ('${id}', '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
    'REQUEST')
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      return  {data:login.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}

async function updateEntryRequestList(id,kategori,subkategori,
  ket,foto_name,qty,fpp,img ) {
  let query = `
  update 	t_task_pic_new 
  set  m_kodekategori = '${kategori}', 
  m_kodesub = '${subkategori}', 
  m_keterangan = '${ket}', 
  m_qty = '${qty}',
  m_nofpp = '${fpp}'`
  if(img){
    query = query+` , m_foto1 = '${foto_name}' ` 
   
  }
  query = query+` 
    where 	m_kode = '${id}'
  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
     
      return  {data:login.recordsets[0],img};
  }catch(error){
      console.log({error})
  }
}
async function detailEntryRequest(nomor) {
  let query = `
    select a.*,b.m_unit as unit,  c.m_mall as mall,  c.m_store_location as location  from t_task_new  a
    LEFT join msunitsupport b on a.m_kodeunit = b.m_kodeunit
    LEFT join dbcmk.dbo.msstore_new c on a.m_kode COLLATE DATABASE_DEFAULT = c.m_kode COLLATE DATABASE_DEFAULT 
    where a.m_nomor = '${nomor}'
   ` 
  let query2 = `
  select a.*,b.m_topic as kategori,c.m_topic as sub,d.m_rating from t_task_pic_new a
  LEFT join mskategorisupport b on a.m_kodekategori = b.m_kodekategori
  LEFT join mssubkategorisupport c on a.m_kodesub = c.m_kodesub
  Left join t_task_review d on a.m_kode = d.m_kode_task
  where a.m_nomor = '${nomor}' order by a.m_kode asc
   ` 
   let query3=`select m_kodesub as value, m_topic as label from mssubkategorisupport`
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let data2 = await pool.request().query(query2);
      let data3 = await pool.request().query(query3);
      let text = ''
   
      let dx = data.recordsets[0][0]
      switch(dx?.m_kode2) {
        case "FC":
          text = "FRANK & CO";
        break;
        case "TP":
        text = "THE PALACE";
        break;
        case "MD":
        text = "MONDIAL";
        break; 
        case "MM":
        text = "MISS MONDIAL";
        break;
        case "GT":
        text = "GTS";
        break;
        default:
        text = "";
      }
      let arrax = {
        unit:{value:dx?.m_kodeunit,label:dx?.unit},
        lokasi:{value:dx?.m_kode2,label:text},
        city:{value:dx?.m_kota,label:dx?.m_kota},
        store:{value:dx?.m_kode,label:dx?.mall+'-'+dx?.location},
        m_nomor:dx?.m_nomor
      }
      
      let dats = data2.recordsets[0]
      let array = [] 
      dats?.map((d)=>{
        array.push({
           
          id:d?.m_kode,
          kategori:d?.m_kodekategori,
          subkategori:d?.m_kodesub,
          ket:d?.m_keterangan,
          imageAddress:axs.PATH_TICKET+'/uploads/entry-request/'+d?.m_foto1,
          imageName:d?.m_foto1,
          qty:d?.m_qty,
          fpp:d?.m_nofpp,
          subKategoriOption:[],
          status:d?.m_status_pic,
          subname:d?.sub,
          score:d?.m_rating?d?.m_rating:'',
          ketScore:'',
          setPic:d?.m_start_pic,
          kategoriname:d?.kategori
        })
      })
      return  {task:arrax,taskPic:array};
  }catch(error){
      console.log({error})
  }
}
async function checkEntryRequestList(nomor) {
 
  let query = `
  select count(*) as row from t_task_pic_new  
 
  where m_kode = '${nomor}'
   ` 
    
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      
      return  {data:data.recordsets[0][0]?.row};
  }catch(error){
      console.log({error})
  }
}

async function deleteEntryRequestList(id) {
  let query = `
  delete from	t_task_pic_new 
 
  where 	m_kode = '${id}'
  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
     
      return  {data:login.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function getGenerateEntryRequestList(unit) {
  let query = `
  select max(right(m_kode,4)) as max from t_task_pic_new where m_nomor = '${unit}'
  ` 
  
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let max = data?.recordsets[0][0]['max']
      let no = ''
      let inc = 0
      let temp = ''
      if (max === ''||max===null){
        no = '1' ;
        inc = 1
      }else{
        no = max?.split('-')[1]
        inc = parseInt(no)+1
        temp = inc.toString()
        no = temp
      }
      let code = unit+'-'+no
      return  {code,inc };
  }catch(error){
      console.log({error})
  }
}
async function approveTicketing(user,id) {
  let query = `
  update 	t_task_pic_new 
  set  
  m_status_pic = 'APPROVE',
  m_approve_time = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
  m_approve_by = '${user}'
  where 	m_kode = '${id}'
  ` 
  let query2 = `
  insert into t_task_history (m_nomortask, m_tanggalpekerjaan, m_statustask) 
  values ('${id}', '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
  'APPROVE')

  `
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let data2 = await pool.request().query(query2);
      return  {data:data.recordsets[0],data2:data2.recordsets[0] };
  }catch(error){
      console.log({error})
  }
}

async function detailFollowUp(id) {
  let query = `
  select a.*,b.m_topic as kategori,c.m_topic as sub from t_task_pic_new a
  LEFT join mskategorisupport b on a.m_kodekategori = b.m_kodekategori
  LEFT join mssubkategorisupport c on a.m_kodesub = c.m_kodesub 
  WHERE m_nomor = '${id}'`
   
  let query2 = `
  select a.m_nomor,a.m_pic,a.m_shift,b.m_namapic from t_task_pic_detail a
  LEFT join mspicsupport b on a.m_pic   = b.m_nik 
  group by a.m_nomor,a.m_pic,a.m_shift,b.m_namapic 

  `
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let data2 = await pool.request().query(query2);
      let dats = data.recordsets[0]
      let dats2 = data2.recordsets[0]
      let array = [] 
      let array2 = [] 
      // let isData = null
      let a = ''
      let txt = ''
      let v
      dats?.map((d)=>{
        dats2?.map((s)=>{
          a = s
          txt = a?.m_nomor
          if (txt?.indexOf(d?.m_kode) > -1) {
              array2.push(a)
          }  
          // array2.push({txt,s:d?.m_kode})
          })
        array.push({
          
          id:d?.m_kode,
          kategori:d?.m_kodekategori,
          subkategori:d?.m_kodesub,
          ket:d?.m_keterangan,
          imageAddress:axs.PATH_TICKET+'/uploads/entry-request/'+d?.m_foto1,
          imageAddress2:axs.PATH_TICKET+'/uploads/entry-request/'+d?.m_foto2,
          imageName:d?.m_foto1,
          imageName2:d?.m_foto2,
          qty:d?.m_qty,
          fpp:d?.m_nofpp,
          subKategoriOption:[],
          status:d?.m_status_pic,
          subname:d?.sub,
          kategoriname:d?.kategori,
          pic:array2,
           
        })
         array2=[]
       
          
        // for (i = 0; i < menu?.userrole.length; i++) {
        //   a = menu?.userrole[i];
        //   txtValue = a?.name ;
        //   if (txtValue?.toUpperCase().indexOf(filter) > -1) {
        //       array.push(a)
        //   }  
        // }
       
      })
      
      return  {data:array
       
      };
  }catch(error){
      console.log({error})
  }
}
async function insertScoring(user,kode,nomor,m_rating,review 
  ) {
  let query = `
  insert into t_task_review (
    m_kode_review,m_kode_task,m_nomor,
    m_rating,m_review,m_review_user,m_review_date
  )
  values ('R-${kode}','${kode}', '${nomor}',
  '${m_rating}','${review}','${user}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}')
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      return  {user,kode,nomor,m_rating,review };
  }catch(error){
      console.log({error})
  }
}


async function checkStockTaskPIC(id,st 
  ) {
  let query = `
  update 	t_task_pic_new 
  set  
  m_status_pic = '${st}',
  m_tgl_item = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
  
  where 	m_kode = '${id}'
  ` 
  let query2 = `
  insert into t_task_history (
    m_nomortask,m_tglpekerjaan,
    m_statustask
  )
  values ('${id}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}', 
  '${st}'  )
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let data2 = await pool.request().query(query2);
      return  {id,st};
  }catch(error){
      console.log({error})
  }
}
async function setPIC(id
  ) {
  let query = `
  update 	t_task_pic_new 
  set  
  m_status_pic = 'SETPIC ',
  m_start_pic = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
  
  where 	m_kode = '${id}'
  ` 
  let query2 = `
  insert into t_task_history (
    m_nomortask,m_tglpekerjaan,
    m_statustask
  )
  values ('${id}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}', 
  'SETPIC'  )
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let data2 = await pool.request().query(query2);
      return  {id};
  }catch(error){
      console.log({error})
  }
}
async function setDetailPic(id,m_pic,shift 
  ) {
   
  let query = `
  insert into t_task_pic_detail (
    m_nomor,m_pic,
    m_shift
  )
  values ('${id}',
  '${m_pic}', 
  '${shift}'  )
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query); 
      return  {id,m_pic,shift };
  }catch(error){
      console.log({error})
  }
}
async function searchPicName( 
  ) {
  let query = `
  select m_namapic as label, m_nik as value from mspicsupport order by m_namapic asc

  ` 
  
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      return  {data:data?.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function listAddQuestionsSq( 
  page,limit,search1,search2,type
  ) {
    let last = limit*page
    let first = last - (limit-1)
    let src =false
  let query = `
  select*from(
    select ROW_NUMBER() OVER 
          (ORDER BY a.id asc) as row
        ,a.*,b.m_nama from t_kuesioner_visit  a
        left join t_type_kuesioner b on a.id_type=b.id
    `
    if(search1 !==''){
      query = query + ` where a.m_pernyataan like '%${search1}%' `
      src = true
    }
    if(search2 !==''){
      query = query + ` ${src?'and':'where'} a.m_feedback like '%${search2}%' `
      src = true
    }
    if(type !==''){
      query = query + ` ${src?'and':'where'} a.id_type = ${type} `
    
    }
    query = query+`  
    ) awek
    
    where row BETWEEN '${first}' AND '${last}'
  ` 
  let query1 = `
  select count(*) as tot from(
    select ROW_NUMBER() OVER 
          (ORDER BY a.id asc) as row
        ,a.*,b.m_nama from t_kuesioner_visit  a
        left join t_type_kuesioner b on a.id_type=b.id
    `
    if(search1 !==''){
      query1 = query1 + ` where a.m_pernyataan like '%${search1}%' `
      src = true
    }
    if(search2 !==''){
      query1 = query1 + ` ${src?'and':'where'} a.m_feedback like '%${search2}%' `
      src = true
    }
    if(type !==''){
      query1 = query1 + ` ${src?'and':'where'} a.id_type = ${type} `
    
    }
    query1 = query1+`  
    ) awek`
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query1);
      
      return  {
        data:data?.recordsets[0],
        
        tot:tot.recordsets[0][0]['tot']
        // query,page,limit,search1,search2,type
      };
  }catch(error){
      console.log({error})
  }
}
async function AddQuestionSq( 
  id_type,pernyataan,feedback,bobot
  ) {
    
  let query = `
  insert into t_kuesioner_visit
  (
      id_type,m_pernyataan,
      m_feedback,
      bobot,
      created_at,
      updated_at
    )
    values ('${id_type}',
    '${pernyataan}',
    '${feedback}',
    '${bobot}',
    '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}', 
    '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}' )
  ` 
  
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      return  {data:data?.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}

async function updateQuestionSq( 
  id,id_type,pernyataan,feedback,bobot
  ) {
    
  let query = `
  update 	t_kuesioner_visit 
  set  
  id_type = '${id_type}',
  m_pernyataan = '${pernyataan}',
  m_feedback = '${feedback}', 
  bobot = '${bobot}',
  updated_at = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
  
  where 	id = '${id}'
  ` 
  
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      return  {data:data?.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function togelQuestionSq( 
  id,st
  ) {
    
  let query = `
  update 	t_kuesioner_visit 
  set  
 
  enable = '${st}',
  
  updated_at = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
  
  where 	id = '${id}'
  ` 
  
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      return  {data:data?.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function deleteQuestionSq( 
  id
  ) {
    
  let query = `
  delete from t_kuesioner_visit where id='${id}'
   
  ` 
  
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      return  {data:data?.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function listAddTypeQuestionSq( 
  page,limit,search
  ) {
    let last = limit*page
    let first = last - (limit-1)
  let query = `
  select * from(
    select
    ROW_NUMBER() OVER 
      (ORDER BY id asc) as row
    ,*
    from t_type_kuesioner
    
    where m_nama like '%${search}%'
    ) as awek
     
    where row BETWEEN '${first}' AND '${last}'
    order by m_nama asc
  ` 
  let query1 = `
  select count(*) as tot from(
    select
    ROW_NUMBER() OVER 
      (ORDER BY id asc) as row
    ,*
    from t_type_kuesioner
    
    where m_nama like '%${search}%'
    ) as awek
     
     

  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query1);
      
      return  {data:data?.recordsets[0],
        tot:tot.recordsets[0][0]['tot']};
  }catch(error){
      console.log({error})
  }
}
async function listSelectTypeQuestionSq( 
  search
  ) {
     
  let query = `
  select  TOP 5  m_nama as label, id as value from
  t_type_kuesioner  where m_nama like '%${search}%'
  where enable = 'true'
  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
     
      
      return  {data:data?.recordsets[0] };
  }catch(error){
      console.log({error})
  }
}
async function checkTypeSq( 
  search
  ) {
     
  let query = `
  select count(*) as row  from
  t_type_kuesioner  where m_nama = '${search.toLowerCase()}'

  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
     
      
      return  {data:data.recordsets[0][0]?.row };
  }catch(error){
      console.log({error})
  }
}
async function addTypeQuestionSq( 
  nama,color
  ) {
    
  let query = `
  insert into t_type_kuesioner
 (
    m_nama,color,created_at,
    updated_at
  )
   values ('${nama}','${color}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}', 
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'  )
  ` 
  
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      return  {data:data?.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function updateTypeQuestionSq( 
  id,nama,color
  ) {
    
  let query = `
  update 	t_type_kuesioner 
  set  
  m_nama = '${nama}',
  color = '${color}',
  updated_at = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
  
  where 	id = '${id}'
  ` 
  
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      return  {data:data?.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function deleteTypeQuestionSq( 
  id
  ) {
    
  let query = `
  delete from t_type_kuesioner where id='${id}'
   
  ` 
  
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      return  {data:data?.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function togelTypeQuestionSq( 
  id,st
  ) {
    
  let query = `
  update 	t_type_kuesioner 
  set  
  enable = '${st}',
  updated_at = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
  
  where 	id = '${id}'
   
  ` 
  
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      return  {data:data?.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function listAddKategoriQuestionSq( 
  page,limit,search
  ) {
    let last = limit*page
    let first = last - (limit-1)
  let query = `
  select * from(
    select
    ROW_NUMBER() OVER 
      (ORDER BY id asc) as row
    ,*
    from t_kategori_kuesioner2
    
    where m_name like '%${search}%'
    ) as awek
     
    where row BETWEEN '${first}' AND '${last}'

  ` 
  let query1 = `
  select count(*) as tot from(
    select
    ROW_NUMBER() OVER 
      (ORDER BY id asc) as row
    ,*
    from t_kategori_kuesioner2
    
    where m_name like '%${search}%'
    ) as awek
     
     

  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query1);
      
      return  {data:data?.recordsets[0],
        tot:tot.recordsets[0][0]['tot']};
  }catch(error){
      console.log({error})
  }
}
async function listSelectKategoriQuestionSq( 
  search
  ) {
     
  let query = `
  select  TOP 5  m_name as label, id as value from
  t_kategori_kuesioner2  where m_name like '%${search}%'

  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
     
      
      return  {data:data?.recordsets[0] };
  }catch(error){
      console.log({error})
  }
}
async function addKategoriQuestionSq( 
  nama
  ) {
    
  let query = `
  insert into t_kategori_kuesioner2
 (
    m_name,created_at,
    updated_at
  )
   values ('${nama}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}', 
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'  )
  ` 
  
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      return  {
        data:data?.recordsets[0]
        // query
      };
  }catch(error){
      console.log({error})
  }
}
async function updateKategoriQuestionSq( 
  id,nama
  ) {
    
  let query = `
  update 	t_kategori_kuesioner2 
  set  
  m_name = '${nama}',
  updated_at = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
  
  where 	id = '${id}'
  ` 
  
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      return  {data:data?.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function deleteKategoriQuestionSq( 
  id
  ) {
    
  let query = `
  delete from t_kategori_kuesioner2 where id='${id}'
   
  ` 
  
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      return  {data:data?.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function togelKategoriQuestionSq( 
  id,st
  ) {
    
  let query = `
  update 	t_kategori_kuesioner2 
  set  
  enable = '${st}',
  updated_at = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
  
  where 	id = '${id}'
   
  ` 
  
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      return  {data:data?.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function checkKategoriSq( 
  search
  ) {
     
  let query = `
  select count(*) as row  from
  t_kategori_kuesioner2  where m_name = '${search.toLowerCase()}'

  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
     
      
      return  {data:data.recordsets[0][0]?.row };
  }catch(error){
      console.log({error})
  }
}

async function addVisitSq( 
  user,
  store,
  tim_sq,
  jr,
  type
  ) {
    
  let query = `
  insert into t_visit_sq2
 (
    created_by,
    store,
    image_visit,
    status_kuesioner,
    tim_sq,
  
    jr,
    type,
    created_at,
    updated_at
  )
   values (
  '${user}',
  '${store}',
  '',
  'UNCOMPLEATE',
  '${tim_sq}',
  
  '${jr}',
  '${type}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}', 
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'  )
  ` 
  let query2 = `select id from t_visit_sq2
  order by id desc
  `
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let id = await pool.request().query(query2);
      return  {
        // data:data?.recordsets[0],
        data:id?.recordsets[0][0]['id']
        // query
      };
  }catch(error){
      console.log({error})
  }
}
async function setKuesioner( 
  visit
  ) {
    
  let query = `
  select a.id,a.id_type, a.m_pernyataan,a.m_feedback,a.bobot,b.m_nama from t_kuesioner_visit a
  left join t_type_kuesioner b on a.id_type = b.id
  where a.enable = 'true'
  order by a.id asc
  `
  let query2 = `
  select distinct(b.m_nama) from t_kuesioner_visit a
  left join t_type_kuesioner b on a.id_type = b.id
  where a.enable = 'true'
  order by b.m_nama asc
  `
  let query3 = `
  select * from t_jawaban_visit where id_visit = '${visit}'
  `
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let data2 = await pool.request().query(query2);
      let data3 = await pool.request().query(query3);
      return  {
        data:data?.recordsets[0],
        data2:data2?.recordsets[0],
        data3:data3?.recordsets[0]
        // query
      };
  }catch(error){
      console.log({error})
  }
}
async function jawabanKuesioner(id,jawaban,type,bobot,id_kuesioner,id_visit){

  let query = `
  insert into t_jawaban_visit 
   (
    id_kuesioner_visit,
    m_jawaban,
    m_note,
    m_bobot,
    id_visit,
    created_at,
    updated_at
  )
   values (
   '${id_kuesioner}',
   '${jawaban}',
   '',
   '${bobot}',
   '${id_visit}',
   '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
   '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
   )
  `
  let query2 = `
  update 	t_jawaban_visit 
  set  `
  if(type==='note'){
    query2 =query2+ ` m_note = '${jawaban}',`
  }else{
   query2 =query2+ ` m_jawaban = '${jawaban}',`
  }
   
   query2 =query2+ ` updated_at = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
  
  where 	id = '${id}'
   
  `
  let query3 = ``
  if(id===0){
    query3 = query
  }else{
    query3 = query2
  }
  try{
  let pool = await sql.connect(configTICKET);
  let data = await pool.request().query(query3);
      return {
        data:data.recordsets[0]
        // ,
        // query3
        // id,jawaban,type,bobot,id_kuesioner,id_visit
      }
  }catch(error){
      console.log({error})
  }
}
async function getDataNoteToPusat( 
  id
  ) {
     
  let query = `
  select a.*,b.m_name as label,b.id as value from
  t_note_to_pusat_kuesioner  a
  left join t_kategori_kuesioner2 b on a.kategori = b.id 
  where a.id_visit = '${id}'

  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let array = [];
      let dats = data?.recordsets[0]
      let r = []
      let kat =[]
      dats.map((d)=>{
        // r = d?.kategori.split(',')
        // r.map((s)=>{
          
        //   kat.push({
        //     value:s,label:s.split('#')[1]
        //   })
        // })
           
           
        
         array.push({
           id:d?.id,
           id_visit:d?.id_visit,
           m_note:d?.m_note,
           m_tanggapan:d?.m_tanggapan,
           kategori:{
            value:d.value,label:d.label
          }
         })
         kat=[]
         r=[]
      })
      
      return  {data:array};
  }catch(error){
      console.log({error})
  }
}
async function insertDataNoteToPusat( 
  id_visit,m_note,m_tanggapan,kategori
  ) {
     
  let query = `
  insert into t_note_to_pusat_kuesioner 
  (
   id_visit, 
   m_note,
   m_tanggapan, 
   kategori,
   created_at,
   updated_at
 )
  values (
  '${id_visit}',
  '${m_note}', 
  '${m_tanggapan}',
  '${kategori}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
  )
  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
     
      
      return  {
        data:data?.recordsets[0]
        // query
      };
  }catch(error){
      console.log({error})
  }
}
async function updateDataNoteToPusat( 
  id,m_note,m_tanggapan,kategori
  ) {
     
  let query = `
  update 	t_note_to_pusat_kuesioner 
  set  
  m_note = '${m_note}',
  m_tanggapan = '${m_tanggapan}', 
  kategori = '${kategori}',
  updated_at = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
  
  where 	id = '${id}'
   
  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
     
      
      return  {
        data:data?.recordsets[0] 
        // query
      };
  }catch(error){
      console.log({error})
  }
}
async function deleteDataNoteToPusat( 
  id
  ) {
     
  let query = `
  delete from t_note_to_pusat_kuesioner where id = '${id}'
  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
     
      
      return  {data:data?.recordsets[0] };
  }catch(error){
      console.log({error})
  }
}
async function getDataVisitDetail( 
  id
  ) {
     
  let query = `
  select * from t_visit_sq2  where id = '${id}'

  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
     
      
      return  {data:data?.recordsets[0][0],
      path:axs.PATH_TICKET+'/uploads/visit-sq/' };
  }catch(error){
      console.log({error})
  }
}
async function insertImageVisit( 
  id,img
  ) {
     
  let query = `
  update 	t_visit_sq2 
  set  
  image_visit = '${img}', 
  updated_at = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
  
  where 	id = '${id}'
  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
     
      
      return  {data:data?.recordsets[0] };
  }catch(error){
      console.log({error})
  }
}
async function setStatusVisit( 
  id,st
  ) {
     
  let query = `
  update 	t_visit_sq2 
  set  
  status_kuesioner = '${st}', 
  updated_at = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
  
  where 	id = '${id}'
  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
     
      
      return  {data:data?.recordsets[0] };
  }catch(error){
      console.log({error})
  }
}
async function getReviesVisit( 
  page,limit,search,store,status,start,end,type
  ) {
    let last = limit*page
    let first = last - (limit-1)
    let isWhere = false
  let query = `
  select * from (
    select ROW_NUMBER() OVER 
        (ORDER BY a.id desc) as row,
        a.id,
        a.status_kuesioner,
        a.created_at,
        a.type,
        d.bobot,
        e.bobot as bobot2,
        b.m_nama as store, c.m_nama from t_visit_sq2 a
    left join dbcmk.dbo.msstore b on b.m_kode COLLATE DATABASE_DEFAULT = a.store COLLATE DATABASE_DEFAULT
    left join dbhrd.dbo.mskaryawan c on c.m_nik COLLATE DATABASE_DEFAULT = a.created_by COLLATE DATABASE_DEFAULT
    left join (select id_visit,SUM(m_bobot) as bobot  from t_jawaban_visit
    where  m_jawaban = 'true'
    group by id_visit) d on a.id=d.id_visit
    left join   (select id_visit,SUM(bobot) as bobot  from t_history_visit
    where  m_jawaban = 'true'
    group by id_visit) e on a.id=e.id_visit
  `
  let query2 = `
  select count(*) as tot from (
    select ROW_NUMBER() OVER 
        (ORDER BY a.id desc) as row,a.id,a.status_kuesioner,a.created_at,
        d.bobot,
        e.bobot as bobot2,b.m_nama as store, c.m_nama from t_visit_sq2 a
    left join dbcmk.dbo.msstore b on b.m_kode COLLATE DATABASE_DEFAULT = a.store COLLATE DATABASE_DEFAULT
    left join dbhrd.dbo.mskaryawan c on c.m_nik COLLATE DATABASE_DEFAULT = a.created_by COLLATE DATABASE_DEFAULT
    left join (select id_visit,SUM(m_bobot) as bobot  from t_jawaban_visit
    where  m_jawaban = 'true'
    group by id_visit) d on a.id=d.id_visit
    left join   (select id_visit,SUM(bobot) as bobot  from t_history_visit
    where  m_jawaban = 'true'
    group by id_visit) e on a.id=e.id_visit
  `

    if(start?.length>0&&end.length>0){
      
    query = query+` where ( a.created_at >= '${start} 00:00:01' and  a.created_at <= '${end} 23:59:59' )`
    query2 =query2+` where (  a.created_at >= '${start}' and  a.created_at <= '${end}' )`
    isWhere = true
    }
    if(search!== ''){
      query = query+` ${isWhere?'and':'where'}  c.m_nama like '%${search}%'`
      query2 = query2+` ${isWhere?'and':'where'}  c.m_nama like '%${search}%'`
       isWhere = true
    }
    if(type!== ''){
      query = query+` ${isWhere?'and':'where'}   a.type = '${type}'`
      query2 = query2+` ${isWhere?'and':'where'}   a.type = '${type}'`
       isWhere = true
    }
    if(store!== ''){
      query = query+` ${isWhere?'and':'where'}  a.store = '${store}'`
      query2 =query2+` ${isWhere?'and':'where'} a.store = '${store}'`
       isWhere = true
    }
    if(status!== ''){
      query = query+` ${isWhere?'and':'where'}  a.status_kuesioner = '${status}'`
      query2 =query2+` ${isWhere?'and':'where'}  a.status_kuesioner = '${status}'`
       isWhere = true
    }
  query =query+ `  ) awek

    where row BETWEEN '${first}' AND '${last}'
  ` 
  query2 =query2+ `  ) awek
 
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query2);
      
      return  {
        data:data?.recordsets[0],
        tot:tot.recordsets[0][0]['tot']
        // query,query2
       };
  }catch(error){
      console.log({error})
  }
}
async function selectKategoriKuesioner( 
  ) {
  let query = `
  select * from t_kategori_kuesioner2 
  where enable = 'true'
  order by m_name asc

  ` 
  
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      return  {data:data?.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}

async function insertDataHistoryKuesioner( 
  id_type,id_kuesioner,id_visit,
  bobot,jwb,approve
  ) {
     
  let query = `
  insert into t_history_visit 
  (
   id_type,
   id_kuesioner, 
   id_visit, 
   bobot,
   m_jawaban,
   approve_by,
   created_at,
   updated_at
 )
  values (
  '${id_type}',
  '${id_kuesioner}',
  '${id_visit}',
  '${bobot}', 
  '${jwb}',
  '${approve}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
  )
  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
     
      
      return  {
        data:data?.recordsets[0]
        // query
      };
  }catch(error){
      console.log({error})
  }
}
async function lineChartDataSQVisit( 
   start,end,brand,location
  ) {
     
  let query = `
  select distinct(a.created_at )
  from t_history_visit a
  left join t_type_kuesioner b on b.id = a.id_type 
  left join t_visit_sq2 c on a.id_visit=c.id
  left join dbcmk.dbo.msstore_new d on d.m_kode COLLATE DATABASE_DEFAULT = c.store COLLATE DATABASE_DEFAULT
  where a.created_at between '${start} 00:00:01' and '${end} 23:59:59'
  ` 
  if(brand!==''){
    query = query+` and d.m_brand = ${brand}`
  }
  if(location!==''){
    query = query+` and d.m_store_location = ${location}`
  }
  let query1 =`
  select SUM(a.bobot) as bobot,a.id_type,a.created_at,b.m_nama 
  from t_history_visit a
  left join t_type_kuesioner b on b.id = a.id_type 
  left join t_visit_sq2 c on a.id_visit=c.id
  left join dbcmk.dbo.msstore_new d on d.m_kode COLLATE DATABASE_DEFAULT = c.store COLLATE DATABASE_DEFAULT
  where a.m_jawaban = 'true'
  and a.created_at between '${start} 00:00:01' and '${end} 23:59:59'
  `
  if(brand!==''){
    query1 = query1+` and d.m_brand = ${brand}`
  }
  if(location!==''){
    query1 = query1+` and d.m_store_location = ${location}`
  }
  query1 =query1+` 
  group by a.id_type,a.created_at,b.m_nama
  `
  let query2 = `
  select distinct(b.m_nama ),b.color
  from t_history_visit a
  left join t_type_kuesioner b on b.id = a.id_type 
  left join t_visit_sq2 c on a.id_visit=c.id
  left join dbcmk.dbo.msstore_new d on d.m_kode COLLATE DATABASE_DEFAULT = c.store COLLATE DATABASE_DEFAULT
  where a.created_at between '${start} 00:00:01' and '${end} 23:59:59'
  `
  if(brand!==''){
    query2 = query2+` and d.m_brand = ${brand}`
  }
  if(location!==''){
    query2 = query2+` and d.m_store_location = ${location}`
  }
  let query3 =`
  select a.id,SUM(b.bobot) as value, a.created_at as label from t_visit_sq2 a
  join t_history_visit b on b.id_visit = a.id
   join dbcmk.dbo.msstore_new c on c.m_kode COLLATE DATABASE_DEFAULT = a.store COLLATE DATABASE_DEFAULT
  where b.m_jawaban = 'true'
  and a.created_at between '${start} 00:00:01' and '${end} 23:59:59'
  `
  if(brand!==''){
    query3 = query3+` and d.m_brand = ${brand}`
  }
  if(location!==''){
    query3 = query3+` and d.m_store_location = ${location}`
  }
  query3 =query3+` 
  group by  a.id,a.created_at order by a.created_at asc
  `
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let data1 = await pool.request().query(query1);
      let data2 = await pool.request().query(query2);
      let data3 = await pool.request().query(query3);
      let dats =data?.recordsets[0]
      let dats1 =data1?.recordsets[0]
      let dats2 =data2?.recordsets[0]
      let dats3 =data3?.recordsets[0]
      let array = [];
      let array2 = [];
      let array3 = [];
      let isData = null
      let rdclr = ''
      dats.map((d)=>{
        array.push({date:moment(d?.created_at).format('YYYY-MM-DD')})
      })
      dats1.map((d)=>{
        isData = array.findIndex(v => moment(v.date).format('YYYY-MM-DD') === moment(d.created_at).format('YYYY-MM-DD'))
        
        array[isData][d?.m_nama] = d?.bobot
        // array2.push({
        //   isData,
        //   dates:d.created_at,
        //   v:array[0].date,
        //   s:moment(array[0].date).format('YYYY-MM-DD'),
        //   d:moment(d.created_at).format('YYYY-MM-DD')
        // })
      })
      dats2.map((d,i)=>{
        rdclr = Math.floor(Math.random()*16777215).toString(16);
        array2.push({
          name:d?.m_nama,
          // color: '#'+rdclr
          color: d?.color
        })
        rdclr = ''
      })
      dats3?.map((d)=>{
        array3?.push({ 
          id:d?.id,value:d?.value,label:moment(d?.label).format('YYYY-MM-DD')
        })
      })
      return  {
        data:array,
        bar:array3,
        // query3,
        kategori:array2
        // query
      };
  }catch(error){
      console.log({error})
  }
}
async function barCharKuesionerSQ( 
  start,end
  ) {
     
  let query = `
  select b.m_name as label,count(b.m_name) as value  from t_note_to_pusat_kuesioner a
  left join t_kategori_kuesioner2 b on b.id = a.kategori
  where a.created_at between '${start} 00:00:01' and '${end} 23:59:59'
  group by b.m_name
  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
     
      
      return  {
        data:data?.recordsets[0]
        // query
      };
  }catch(error){
      console.log({error})
  }
}
async function detailBarCharSQ( 
  start,end,nama,limit,page
  ) {
    let last = limit*page
    let first = last - (limit-1)
  let query = `
  select * from (
    select ROW_NUMBER() OVER 
        (ORDER BY a.created_at desc) as row,a.m_note,a.m_tanggapan,a.created_at,b.m_name,c.type,e.m_nama as store from t_note_to_pusat_kuesioner a
  left join t_kategori_kuesioner2 b on a.kategori = b.id
  left join t_visit_sq2 c on a.id_visit = c.id
  left join dbcmk.dbo.msstore_new d on d.m_kode COLLATE DATABASE_DEFAULT = c.store COLLATE DATABASE_DEFAULT
  left join dbcmk.dbo.msmaster e on e.m_kode COLLATE DATABASE_DEFAULT = d.m_mall COLLATE DATABASE_DEFAULT
  where b.m_name = '${nama}'
  and a.created_at between '${start} 00:00:01' and '${end} 23:59:59'
  ) awek`
  if(page>0&&limit>0){
  query =query+`  
 where row BETWEEN '${first}' AND '${last}'
  ` 
}
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
     
      
      return  {data:data?.recordsets[0] };
  }catch(error){
      console.log({error})
  }
}
async function getReviesVisitExport( 
  search,store,status,start,end,type
  ) {
 
    let isWhere = false
  let query = `
  select * from (
    select ROW_NUMBER() OVER 
        (ORDER BY a.id desc) as row,
        a.id,
        a.status_kuesioner,
        a.created_at,
        a.type,
        d.bobot,
        e.bobot as bobot2,
        b.m_nama as store, c.m_nama from t_visit_sq2 a
    left join dbcmk.dbo.msstore b on b.m_kode COLLATE DATABASE_DEFAULT = a.store COLLATE DATABASE_DEFAULT
    left join dbhrd.dbo.mskaryawan c on c.m_nik COLLATE DATABASE_DEFAULT = a.created_by COLLATE DATABASE_DEFAULT
    left join (select id_visit,SUM(m_bobot) as bobot  from t_jawaban_visit
    where  m_jawaban = 'true'
    group by id_visit) d on a.id=d.id_visit
    left join   (select id_visit,SUM(bobot) as bobot  from t_history_visit
    where  m_jawaban = 'true'
    group by id_visit) e on a.id=e.id_visit
  `
   

    if(start?.length>0&&end.length>0){
      
    query = query+` where ( a.created_at >= '${start} 00:00:01' and  a.created_at <= '${end} 23:59:59' )`
     
    isWhere = true
    }
    if(search!== ''){
      query = query+` ${isWhere?'and':'where'}  c.m_nama like '%${search}%'`
      
       isWhere = true
    }
    if(type!== ''){
      query = query+` ${isWhere?'and':'where'}   a.type = '${type}'`
      
       isWhere = true
    }
    if(store!== ''){
      query = query+` ${isWhere?'and':'where'}  a.store = '${store}'`
       
       isWhere = true
    }
    if(status!== ''){
      query = query+` ${isWhere?'and':'where'}  a.status_kuesioner = '${status}'`
       
       isWhere = true
    }
  query =query+ `  ) awek
 
  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
  
      
      return  {
        data:data?.recordsets[0],
   
        // query,query2
       };
  }catch(error){
      console.log({error})
  }
}
module.exports = { 
    getReviesVisitExport,
    detailBarCharSQ,
    barCharKuesionerSQ,
    lineChartDataSQVisit,
    insertDataHistoryKuesioner,
    selectKategoriKuesioner,
    setStatusVisit,
    getReviesVisit,
    insertImageVisit,
    getDataVisitDetail,
    updateDataNoteToPusat,
    deleteDataNoteToPusat,
    insertDataNoteToPusat,
    getDataNoteToPusat,
    jawabanKuesioner,
    setKuesioner,
    addVisitSq,
    checkKategoriSq,
    listSelectKategoriQuestionSq,
    addKategoriQuestionSq,
    listAddKategoriQuestionSq,
    togelKategoriQuestionSq,
    deleteKategoriQuestionSq,
    updateKategoriQuestionSq,
    togelTypeQuestionSq,
    togelQuestionSq,
    listSelectTypeQuestionSq,
    checkTypeSq,
    listAddQuestionsSq,
    AddQuestionSq,
    updateQuestionSq,
    deleteQuestionSq,
    listAddTypeQuestionSq,
    addTypeQuestionSq,
    updateTypeQuestionSq,
    deleteTypeQuestionSq,
    setDetailPic,
    setPIC,
    searchPicName,
    insertScoring,
    checkStockTaskPIC,
    getHistoryTiket,
    detailFollowUp,
    checkEntryRequestList,
    deleteEntryRequestList,
    detailEntryRequest,
    insertEntryRequest,
    updateEntryRequest,
    insertEntryRequestList,
    updateEntryRequestList,
    getGenerateEntryRequest,
    getGenerateEntryRequestList,
    getExportFollowUpPIC,
    getExportFollowUp,
    getSubKategoriSupport,
    getKategoriSupport,
    getFollow,
    getListUnit,
    getMonitoring,
    getDataToDoList,
    getDataEntry ,
    getSelesaiFollowUp,
    insertEntryRequesHistory,
    approveTicketing
}