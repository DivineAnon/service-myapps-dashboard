 
const configTICKET = require('./dbticket');
const axs = require('./axios'); 
const sql = require('mssql');
const  moment = require('moment');

const { NewMssql } = require('./pkg/mssql');
const { tipeSQRaporGrommingCheckin, tipeSQRaportMysteryShopper, tipeSQRaportHardComplaint, tipeSQRaportInternalVisit, tipeSQRaportSMRoleplay } = require('./helper/option');
const { querySQRaport } = require('./pkg/query_builder');
const { replaceAll, mergeSort, sortingConditionForSQRaport, mapToObject } = require('./helper/common');
const { net } = require('./helper/net');
const { formatValue } = require('./helper/query');
const { paginationPageOffset } = require('./helper/pagination');
const { queryGetLastSumBobot } = require('./query/visit_sq');

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
  a.id_history ,
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
a.id_history ,
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
order by a.id_history asc
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
    a.m_kota,
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
		f.m_status_pic,
    i.m_nama as pic_name,
    
    i.m_nomor as task_id,
    j.m_rating,
    j.m_review,
    j.m_kode_review
		from t_task_new a
		join dbhrd.dbo.mskaryawan b on a.m_requestby = b.m_nik
		join dbhrd.dbo.msdepartemen c on b.m_departemen = c.m_iddept
		join dbhrd.dbo.msdivisi d on b.m_divisi = d.m_iddivisi 
		join msunitsupport e on a.m_kodeunit = e.m_kodeunit 
		join t_task_pic_new f on a.m_nomor = f.m_nomor
		join mskategorisupport g on f.m_kodekategori = g.m_kodekategori 
    join (select z.*,bs.m_nama from t_task_pic_detail z
      join dbhrd.dbo.mskaryawan bs on z.m_pic = bs.m_nik	) i on i.m_nomor = f.m_kode
    join (select v.*,bx.m_nama from t_task_review v
      join dbhrd.dbo.mskaryawan bx on v.m_review_user = bx.m_nik	) j on j.m_kode_task = f.m_kode
		where (convert(varchar(10),a.m_tanggal,103) between '${moment(start).format()}' and '${moment(end).format('DD/MM/YYYY')}' ) and a.m_kodeunit = '${unit}'`
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
    a.m_kota,
    f.m_status_pic,
    i.m_nama as pic_name,
    
    i.m_nomor as task_id,
    j.m_rating,
    j.m_review,
    j.m_kode_review
    from t_task_new a
    join dbhrd.dbo.mskaryawan b on a.m_requestby = b.m_nik
    join dbhrd.dbo.msdepartemen c on b.m_departemen = c.m_iddept
    join dbhrd.dbo.msdivisi d on b.m_divisi = d.m_iddivisi 
    join msunitsupport e on a.m_kodeunit = e.m_kodeunit 
    join t_task_pic_new f on a.m_nomor = f.m_nomor
    join mskategorisupport g on f.m_kodekategori = g.m_kodekategori 
    join mssubkategorisupport h on f.m_kodesub = h.m_kodesub 	
    join (select z.*,bs.m_nama from t_task_pic_detail z
      join dbhrd.dbo.mskaryawan bs on z.m_pic = bs.m_nik	) i on i.m_nomor = f.m_kode
    join (select v.*,bx.m_nama from t_task_review v
      join dbhrd.dbo.mskaryawan bx on v.m_review_user = bx.m_nik	) j on j.m_kode_task = f.m_kode
    where (convert(varchar(10),a.m_tanggal,103) between '${moment(start).format('DD/MM/YYYY')}' and '${moment(end).format('DD/MM/YYYY')}' ) and a.m_kodeunit = '02'`
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
		f.m_status_pic,
    i.m_nama as pic_name,
    a.m_kota,
    i.m_nomor as task_id,
    j.m_rating,
    j.m_review,
    j.m_kode_review
		from t_task_new a
		join dbhrd.dbo.mskaryawan b on a.m_requestby = b.m_nik
		join dbhrd.dbo.msdepartemen c on b.m_departemen = c.m_iddept
		join dbhrd.dbo.msdivisi d on b.m_divisi = d.m_iddivisi 
		join msunitsupport e on a.m_kodeunit = e.m_kodeunit 
		join t_task_pic_new f on a.m_nomor = f.m_nomor
		join mskategorisupport g on f.m_kodekategori = g.m_kodekategori 
		join mssubkategorisupport h on f.m_kodesub = h.m_kodesub 	
    join (select z.*,bs.m_nama from t_task_pic_detail z
      join dbhrd.dbo.mskaryawan bs on z.m_pic = bs.m_nik	) i on i.m_nomor = f.m_kode
    join (select v.*,bx.m_nama from t_task_review v
      join dbhrd.dbo.mskaryawan bx on v.m_review_user = bx.m_nik	) j on j.m_kode_task = f.m_kode
		where (convert(varchar(10),a.m_tanggal,103) between '${moment(start).format('DD/MM/YYYY')}' and '${moment(end).format('DD/MM/YYYY')}' )`
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
      let array = [];
      let dats = data.recordsets[0]
      let tmp_pic = ''
      dats.map((d,i)=>{
        idx = array.findIndex(v => v.task_id == d?.task_id)
        if(idx>=0){
          tmp_pic = array[idx]['pic_name']
          array[idx]['pic_name'] = tmp_pic+','+d?.pic_name
          tmp_pic = ''
        }
        else{
       
        array.push({
          no:i+1,
          nomor_ticket:d?.nomor_ticket==='null'||d?.nomor_ticket===null||d?.nomor_ticket===''?'-':d?.nomor_ticket,
          tanggal_ticket:d?.tanggal_ticket==='null'||d?.tanggal_ticket===null||d?.tanggal_ticket===''?'-':d?.tanggal_ticket,
          divisi: d?.divisi==='null'||d?.divisi===null||d?.divisi===''?'-':d?.divisi,
          departemen:d?.departemen==='null'||d?.departemen===null||d?.departemen===''?'-':d?.departemen,
          nama: d?.nama==='null'||d?.nama===null||d?.nama===''?'-':d?.nama,
          unit_support: d?.unit_support==='null'|| d?.unit_support===null||d?.unit_support===''?'-':d?.unit_support,
          lokasi: d?.lokasi==='null'||d?.lokasi===null||d?.lokasi===''?'-':d?.lokasi,
          kode_toko: d?.kode_toko==='null'||d?.kode_toko===null||d?.kode_toko===''?'-':d?.kode_toko,
          kategori: d?.kategori==='null'||d?.kategori===null||d?.kategori===''?'-':d?.kategori,
          subkategori: d?.subkategori==='null'||d?.subkategori===null||d?.subkategori===''?'-':d?.subkategori,
          quantity: d?.quantity==='null'||d?.quantity===null||d?.quantity===''?'-':d?.quantity,
          tanggal_set_pic: d?.tanggal_set_pic==='null'||d?.tanggal_set_pic===null||d?.tanggal_set_pic===''?'-':d?.tanggal_set_pic,
          tanggal_response: d?.tanggal_response==='null'||d?.tanggal_response===null||d?.tanggal_response===''?'-':d?.tanggal_response,
          tanggal_selesai: d?.tanggal_selesai==='null'||d?.tanggal_selesai===null||d?.tanggal_selesai===''?'-':d?.tanggal_selesai,
          tanggal_approve: d?.tanggal_approve==='null'||d?.tanggal_approve===null||d?.tanggal_approve===''?'-':d?.tanggal_approve,
          m_status_pic: d?.m_status_pic==='null'||d?.m_status_pic===null||d?.m_status_pic===''?'-':d?.m_status_pic,
          kota : d?.m_kota==='null'||d?.m_kota===null||d?.m_kota===''?'-':d?.m_kota==='undefined'?'JAKARTA':d?.m_kota,
          no_fpp: d?.no_fpp==='null'||d?.no_fpp===null||d?.no_fpp===''?'-':d?.no_fpp,
          pic_name: d?.pic_name==='null'||d?.pic_name===null||d?.pic_name===''?'-':d?.pic_name,
          task_id: d?.task_id==='null'||d?.task_id===null||d?.pic_name===''?'-':d?.task_id,
          rating:d?.m_rating==='null'||d?.m_rating===null||d?.m_rating===''?'-':d?.m_rating,
          ket_rating:d?.m_review==='null'||d?.m_review===null||d?.m_review===''?'-':d?.m_review
          // kode: d?.kode===null||d?.kode===''?'-':d?.kode,
         })
        }
      })
      
      return  {data:array};
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
		f.m_status_pic,
    i.m_nama as pic_name,
    a.m_kota,
    i.m_nomor as task_id,
    j.m_rating,
    j.m_review,
    j.m_kode_review
		from t_task_new a
		join dbhrd.dbo.mskaryawan b on a.m_requestby = b.m_nik
		join dbhrd.dbo.msdepartemen c on b.m_departemen = c.m_iddept
		join dbhrd.dbo.msdivisi d on b.m_divisi = d.m_iddivisi 
		join msunitsupport e on a.m_kodeunit = e.m_kodeunit 
		join t_task_pic_new f on a.m_nomor = f.m_nomor
		join mskategorisupport g on f.m_kodekategori = g.m_kodekategori 
    join (select z.*,bs.m_nama from t_task_pic_detail z
      join dbhrd.dbo.mskaryawan bs on z.m_pic = bs.m_nik	) i on i.m_nomor = f.m_kode
    join (select v.*,bx.m_nama from t_task_review v
      join dbhrd.dbo.mskaryawan bx on v.m_review_user = bx.m_nik	) j on j.m_kode_task = f.m_kode
		where (convert(varchar(10),a.m_tanggal,103) between '${moment(start).format('DD/MM/YYYY')}' and '${moment(end).format('DD/MM/YYYY')}' ) 
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
      i.m_nama as pic_name,
      a.m_kota,
      i.m_nomor as task_id,
      j.m_rating,
      j.m_review,
      j.m_kode_review
			from t_task_new a
			join dbhrd.dbo.mskaryawan b on a.m_requestby = b.m_nik
			join dbhrd.dbo.msdepartemen c on b.m_departemen = c.m_iddept
			join dbhrd.dbo.msdivisi d on b.m_divisi = d.m_iddivisi 
			join msunitsupport e on a.m_kodeunit = e.m_kodeunit 
			join t_task_pic_new f on a.m_nomor = f.m_nomor
			join mskategorisupport g on f.m_kodekategori = g.m_kodekategori 
			join mssubkategorisupport h on f.m_kodesub = h.m_kodesub 
			join t_task_pic_detail i on f.m_kode = i.m_nomor 
			 
      join (select z.*,bs.m_nama from t_task_pic_detail z
        join dbhrd.dbo.mskaryawan bs on z.m_pic = bs.m_nik	) i on i.m_nomor = f.m_kode
      join (select v.*,bx.m_nama from t_task_review v
        join dbhrd.dbo.mskaryawan bx on v.m_review_user = bx.m_nik	) j on j.m_kode_task = f.m_kode
			where (convert(varchar(10),a.m_tanggal,103) between '${moment(start).format('DD/MM/YYYY')}' and '${moment(end).format('DD/MM/YYYY')}' ) and a.m_kodeunit = '02'`
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
		f.m_status_pic,
    i.m_nama as pic_name,
    a.m_kota,
    i.m_nomor as task_id,
    j.m_rating,
    j.m_review,
    j.m_kode_review 
		from t_task_new a  
		join dbhrd.dbo.mskaryawan b on a.m_requestby = b.m_nik
		join dbhrd.dbo.msdepartemen c on b.m_departemen = c.m_iddept
		join dbhrd.dbo.msdivisi d on b.m_divisi = d.m_iddivisi 
		join msunitsupport e on a.m_kodeunit = e.m_kodeunit 
		join t_task_pic_new f on a.m_nomor = f.m_nomor
		join mskategorisupport g on f.m_kodekategori = g.m_kodekategori
    join mssubkategorisupport h on f.m_kodesub = h.m_kodesub 
    join (select z.*,bs.m_nama from t_task_pic_detail z
      join dbhrd.dbo.mskaryawan bs on z.m_pic = bs.m_nik	) i on i.m_nomor = f.m_kode
    join (select v.*,bx.m_nama from t_task_review v
      join dbhrd.dbo.mskaryawan bx on v.m_review_user = bx.m_nik	) j on j.m_kode_task = f.m_kode
		where (convert(varchar(10),a.m_tanggal,103) between '${moment(start).format('DD/MM/YYYY')}' and '${moment(end).format('DD/MM/YYYY')}' )`
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
      let array = [];
      let dats = data.recordsets[0]
      let tmp_pic = ''
      dats.map((d,i)=>{
        idx = array.findIndex(v => v.task_id == d?.task_id)
        if(idx>=0){
          tmp_pic = array[idx]['pic_name']
          array[idx]['pic_name'] = tmp_pic+','+d?.pic_name
          tmp_pic = ''
        }
        else{
       
        array.push({
          no:i+1,
          nomor_ticket:d?.nomor_ticket==='null'||d?.nomor_ticket===null||d?.nomor_ticket===''?'-':d?.nomor_ticket,
          tanggal_ticket:d?.tanggal_ticket==='null'||d?.tanggal_ticket===null||d?.tanggal_ticket===''?'-':d?.tanggal_ticket,
          divisi: d?.divisi==='null'||d?.divisi===null||d?.divisi===''?'-':d?.divisi,
          departemen:d?.departemen==='null'||d?.departemen===null||d?.departemen===''?'-':d?.departemen,
          nama: d?.nama==='null'||d?.nama===null||d?.nama===''?'-':d?.nama,
          unit_support: d?.unit_support==='null'|| d?.unit_support===null||d?.unit_support===''?'-':d?.unit_support,
          lokasi: d?.lokasi==='null'||d?.lokasi===null||d?.lokasi===''?'-':d?.lokasi,
          kode_toko: d?.kode_toko==='null'||d?.kode_toko===null||d?.kode_toko===''?'-':d?.kode_toko,
          kategori: d?.kategori==='null'||d?.kategori===null||d?.kategori===''?'-':d?.kategori,
          subkategori: d?.subkategori==='null'||d?.subkategori===null||d?.subkategori===''?'-':d?.subkategori,
          quantity: d?.quantity==='null'||d?.quantity===null||d?.quantity===''?'-':d?.quantity,
          tanggal_set_pic: d?.tanggal_set_pic==='null'||d?.tanggal_set_pic===null||d?.tanggal_set_pic===''?'-':d?.tanggal_set_pic,
          tanggal_response: d?.tanggal_response==='null'||d?.tanggal_response===null||d?.tanggal_response===''?'-':d?.tanggal_response,
          tanggal_selesai: d?.tanggal_selesai==='null'||d?.tanggal_selesai===null||d?.tanggal_selesai===''?'-':d?.tanggal_selesai,
          tanggal_approve: d?.tanggal_approve==='null'||d?.tanggal_approve===null||d?.tanggal_approve===''?'-':d?.tanggal_approve,
          m_status_pic: d?.m_status_pic==='null'||d?.m_status_pic===null||d?.m_status_pic===''?'-':d?.m_status_pic,
          kota : d?.m_kota==='null'||d?.m_kota===null||d?.m_kota===''?'-':d?.m_kota==='undefined'?'JAKARTA':d?.m_kota,
          no_fpp: d?.no_fpp==='null'||d?.no_fpp===null||d?.no_fpp===''?'-':d?.no_fpp,
          pic_name: d?.pic_name==='null'||d?.pic_name===null||d?.pic_name===''?'-':d?.pic_name,
          task_id: d?.task_id==='null'||d?.task_id===null||d?.pic_name===''?'-':d?.task_id,
          rating:d?.m_rating==='null'||d?.m_rating===null||d?.m_rating===''?'-':d?.m_rating,
          ket_rating:d?.m_review==='null'||d?.m_review===null||d?.m_review===''?'-':d?.m_review
          // kode: d?.kode===null||d?.kode===''?'-':d?.kode,
         })
        }
      })
      
      return  {data:array};
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
        no = '0001' ;
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
async function insertEntrySetPicHistory(id 
  ) {
  let query = `
  insert into t_task_history ( m_nomortask, m_tglpekerjaan, 
  m_statustask)
  values ('${id}', '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
    'SETPIC')
  ` 
  let query1 = `
  update 	t_task_pic_new 
  set 
  m_start_pic = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}', 
  m_status_pic = 'SETPIC'
  where 	m_kode = '${id}'
 
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      let d = await pool.request().query(query1);
      return  {data:login.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function insertFotoFollowUp(id,name 
  ) {
  let query = `
  update 	t_task_pic_new 
  set 
  m_foto2 = '${name}' 
   
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
async function deleteFollowUp(id 
  ) {
  let query1 = `
    delete  t_task_review where m_nomor = '${id}'
  ` 
  let query2 = `
    delete  t_task_pic_new where m_nomor = '${id}'
  ` 
  let query3 = `
    delete  t_task_new where m_nomor = '${id}'
  ` 
  let query4 = `
    delete   t_task_pic_detail  where m_nomor like '%${id}%'
  ` 
  let query5 = `
    delete  t_task_history  where m_nomortask like '%${id}%'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query1); 
      let data2 = await pool.request().query(query2); 
      let data3 = await pool.request().query(query3); 
      let data4 = await pool.request().query(query4); 
      let data5 = await pool.request().query(query5); 
      return  {data:data.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function insertEntrySetStatusTask(id,status,user
  ) {
  let query = `
  insert into t_task_history ( m_nomortask, m_tglpekerjaan, 
  m_statustask)
  values ('${id}', '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
    '${status}')
  ` 
  let query1 = `
  update 	t_task_pic_new 
  set `
  if(status==='PREPAREITEM'){
    query1 = query1+` m_tgl_itempreparation = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}', `
  }
  if(status==='ONTHEWAY'){
    query1 = query1+` m_tgl_shop = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}', `
  }
  if(status==='DOING'){
    query1 = query1+` m_doing_time = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}', `
    query1 = query1+` m_isdoing = '1', `
    query1 = query1+` m_doing_by = '${user}', `
  }
  if(status==='DONE'){
    query1 = query1+` m_done_time = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}', `
    
    query1 = query1+` m_done_by = '${user}', `
  }
  
  query1 = query1+` m_status_pic = '${status}'
  where 	m_kode = '${id}'
 
  ` 
  let query2 = `
  update 	t_task_new 
  set `
 
  query2 = query2+` m_status = '${status}'`
  
  query2 = query2+` 
  where 	m_nomor = '${id?.split('-')[0]}'
 
  ` 
  let query3 =  `
  select COUNT(*) as row from t_task_pic_new where m_nomor ='${id?.split('-')[0]}'
  ` 
  let query4 =  `
  select COUNT(*) as row from t_task_pic_new where m_nomor ='${id?.split('-')[0]}'
  and m_status_pic = '${status}'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      let d = await pool.request().query(query1);
      let a
      let b
      let c
      if(status==='DOING'){
        a = await pool.request().query(query2);
      }
      if(status==='DONE'){
        b = await pool.request().query(query3);
        c = await pool.request().query(query4);
        if((b?.recordsets[0][0]['row'])===c?.recordsets[0][0]['row']){
          a = await pool.request().query(query2);
        }
      }
      return  {data:login.recordsets[0]};
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
  insert into t_task_history (m_nomortask, m_tglpekerjaan, m_statustask) 
  values ('${id}', '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
  'APPROVE')

  `
  let query5 = `
  update 	t_task_new 
  set `
 
  query5 = query5+` m_status = 'APPROVE'`
  
  query5 = query5+` 
  where 	m_nomor = '${id?.split('-')[0]}'
 
  ` 
  let query3 =  `
  select COUNT(*) as row from t_task_pic_new where m_nomor ='${id?.split('-')[0]}'
  ` 
  let query4 =  `
  select COUNT(*) as row from t_task_pic_new where m_nomor ='${id?.split('-')[0]}'
  and m_status_pic = 'APPROVE'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let data2 = await pool.request().query(query2);
      let a  
       
      let b = await pool.request().query(query3);
      let c = await pool.request().query(query4);
        if((b?.recordsets[0][0]['row'])===c?.recordsets[0][0]['row']){
          a = await pool.request().query(query5);
        }
      
      return  {data:data.recordsets[0],data2:data2.recordsets[0] };
  }catch(error){
      console.log({error})
  }
}

async function insertEntrySetPicDetail(id,pic,m_shift 
  ) {
  let query = `
  insert into t_task_pic_detail ( m_nomor, m_pic, 
  m_shift)
  values ('${id}', '${pic}',
    '${m_shift}')
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
  set 
`
  if( kategori!==''){
    query = query+`   m_kodekategori = '${kategori}',  ` 
   
  }
  if( subkategori!==''){
    query = query+` m_kodesub = '${subkategori}',  ` 
   
  }
  if( ket!==''){
    query = query+`  m_keterangan = '${ket}',  ` 
   
  }
  if( qty!==''){
    query = query+` m_qty = '${qty}', ` 
   
  }
  if( fpp!==''){
    query = query+`   m_nofpp = '${fpp}' ` 
   
  }
  if(img){
    query = query+` , m_foto1 = '${foto_name}' ` 
   
  }
  query = query+` 
    where 	m_kode = '${id}'
  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
     
      return  {data:login.recordsets[0] };
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

async function detailFollowUp(id) {
  let query = `
  select a.*,b.m_topic as kategori,c.m_topic as sub,d.m_kodeunit from t_task_pic_new a
  LEFT join mskategorisupport b on a.m_kodekategori = b.m_kodekategori
  LEFT join mssubkategorisupport c on a.m_kodesub = c.m_kodesub 
  LEFT join t_task_new d on a.m_nomor = d.m_nomor
  WHERE a.m_nomor = '${id}'`
   
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
           m_kodeunit:d?.m_kodeunit
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
async function searchPicName( kode
  ) {
  let query = `
  select m_namapic as label, m_nik as value from mspicsupport
  where m_kodeunit = '${kode}'
  order by m_namapic asc

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
    let src1 =false
  let query = `
  select*from(
    select ROW_NUMBER() OVER 
          (ORDER BY a.id asc) as row
        ,a.*,UPPER(b.m_nama) as m_nama from t_kuesioner_visit  a
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
        ,a.*,UPPER(b.m_nama) as m_nama from t_kuesioner_visit  a
        left join t_type_kuesioner b on a.id_type=b.id
    `
    if(search1 !==''){
      query1 = query1 + ` where a.m_pernyataan like '%${search1}%' `
      src1 = true
    }
    if(search2 !==''){
      query1 = query1 + ` ${src1?'and':'where'} a.m_feedback like '%${search2}%' `
      src1 = true
    }
    if(type !==''){
      query1 = query1 + ` ${src1?'and':'where'} a.id_type = ${type} `
    
    }
    query1 = query1+`  
    ) awek`
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query1);
      
      return  {
        data:data?.recordsets[0],
        // query1,query
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
  and enable = 'true'
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
  type,
  date
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
  'UNCOMPLETE',
  '${tim_sq}',
  
  '${jr}',
  '${type}',
  '${date}', 
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
  select a.id,a.id_type, a.m_pernyataan,a.m_feedback,a.bobot,UPPER(b.m_nama) as m_nama from t_kuesioner_visit a
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
    // join dbcmk.dbo.msstore_new b on b.m_kode COLLATE DATABASE_DEFAULT = a.store COLLATE DATABASE_DEFAULT
  // let query = `
  // select  a.*,b.m_nama from t_visit_sq2  a 
  // join dbcmk.dbo.msmaster b on b.m_kode COLLATE DATABASE_DEFAULT = a.store COLLATE DATABASE_DEFAULT
  // where a.id = '${id}'

  // ` 
//   let query = `
//   select d.*,(e.brand+ ' - ' +e.mall) as m_nama,f.m_nama as jr_nama from t_visit_sq2 d
// join (SELECT a.m_kode as m_kode, b.m_nama as brand, c.m_nama as mall FROM dbcmk.dbo.msstore_new a
// 		join dbcmk.dbo.msmaster b on a.m_brand = b.m_kode
// 		join dbcmk.dbo.msmaster c on a.m_mall = c.m_kode
// 		WHERE 
// 		b.m_type = 'BRAND' AND c.m_type = 'MALL')

// e on e.m_kode COLLATE DATABASE_DEFAULT = d.store COLLATE DATABASE_DEFAULT
// join dbhrd.dbo.mskaryawan f on f.m_nik = d.jr 
//  where d.id = '${id}'

//   ` 
let query = `
select d.*,(e.brand+ ' - ' +e.mall) as m_nama,f.m_nama as jr_nama from t_visit_sq2 d
join (SELECT a.m_kode as m_kode, b.m_nama as brand, c.m_nama as mall FROM dbcmk.dbo.msstore_new a
 
  join (select* from dbcmk.dbo.msmaster where m_type = 'BRAND' ) b on a.m_brand = b.m_kode
  join (select* from dbcmk.dbo.msmaster where m_type = 'MALL') c on a.m_mall = c.m_kode
  WHERE 
  b.m_type = 'BRAND' AND c.m_type = 'MALL')

e on e.m_kode COLLATE DATABASE_DEFAULT = d.store COLLATE DATABASE_DEFAULT
join dbhrd.dbo.mskaryawan f on f.m_nik = d.jr 
where d.id = '${id}'

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
        b.m_nama as store, c.m_nama,c.m_nik from t_visit_sq2 a
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
        e.bobot as bobot2,b.m_nama as store, c.m_nama,c.m_nik from t_visit_sq2 a
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
      
    query = query+` where ( a.created_at >= '${start}' and  a.created_at <= '${end}' )`
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
        // ,query,query2
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
  select distinct(c.created_at )
  from t_history_visit a
  left join t_type_kuesioner b on b.id = a.id_type 
  left join t_visit_sq2 c on a.id_visit=c.id
  left join dbcmk.dbo.msstore_new d on d.m_kode COLLATE DATABASE_DEFAULT = c.store COLLATE DATABASE_DEFAULT
  where c.created_at between '${start} 00:00:01' and '${end} 23:59:59'
  ` 
  if(brand!==''){
    query = query+` and d.m_brand = '${brand}'`
  }
  if(location!==''){
    query = query+` and d.m_kode = '${location}'`
  }
  let query1 =`
  select SUM(a.bobot) as bobot,a.id_type,c.created_at,UPPER(b.m_nama) as m_nama
  from t_history_visit a
  left join t_type_kuesioner b on b.id = a.id_type 
  left join t_visit_sq2 c on a.id_visit=c.id
  left join dbcmk.dbo.msstore_new d on d.m_kode COLLATE DATABASE_DEFAULT = c.store COLLATE DATABASE_DEFAULT
  where a.m_jawaban = 'true'
  and c.created_at between '${start} 00:00:01' and '${end} 23:59:59'
  `
  if(brand!==''){
    query1 = query1+` and d.m_brand = '${brand}'`
  }
  if(location!==''){
    query1 = query1+` and d.m_kode = '${location}'`
  }
  query1 =query1+` 
  group by a.id_type,c.created_at,b.m_nama
  `
  let query2 = `
  select distinct(b.m_nama ),b.color
  from t_history_visit a
  left join t_type_kuesioner b on b.id = a.id_type 
  left join t_visit_sq2 c on a.id_visit=c.id
  left join dbcmk.dbo.msstore_new d on d.m_kode COLLATE DATABASE_DEFAULT = c.store COLLATE DATABASE_DEFAULT
  where c.created_at between '${start} 00:00:01' and '${end} 23:59:59'
  `
  if(brand!==''){
    query2 = query2+` and d.m_brand = '${brand}'`
  }
  if(location!==''){
    query2 = query2+` and d.m_kode = '${location}'`
  }
  // let query3 =`
  // select a.id,SUM(b.bobot) as value, a.created_at as label from t_visit_sq2 a
  // join t_history_visit b on b.id_visit = a.id
  //  join dbcmk.dbo.msstore_new c on c.m_kode COLLATE DATABASE_DEFAULT = a.store COLLATE DATABASE_DEFAULT
  // where b.m_jawaban = 'true'
  // and a.created_at between '${start} 00:00:01' and '${end} 23:59:59'
  // `
  let query3 =`
  select a.id,SUM(b.bobot) as value, a.created_at as label 
   ,( d.m_nama+ ' - ' + e.m_nama) as m_nama
   from t_visit_sq2 a
   join t_history_visit b on b.id_visit = a.id
   join dbcmk.dbo.msstore_new c on c.m_kode COLLATE DATABASE_DEFAULT = a.store COLLATE DATABASE_DEFAULT
   join (select* from dbcmk.dbo.msmaster where m_type = 'BRAND' ) d on c.m_brand  = d.m_kode 
   join (select* from dbcmk.dbo.msmaster where m_type = 'MALL') e on c.m_mall = e.m_kode
   where b.m_jawaban = 'true'    
  and a.created_at between '${start} 00:00:01' and '${end} 23:59:59'
  `
  if(brand!==''){
    query3 = query3+` and c.m_brand = '${brand}'`
  }
  if(location!==''){
    query3 = query3+` and c.m_kode = '${location}'`
  }
  query3 =query3+` 
  group by  a.id,a.created_at,d.m_nama,e.m_nama order by SUM(b.bobot) desc
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
      let array4 = [];
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
          id:d?.id,
          value:d?.value,
          label:d?.m_nama +' '+ moment(d?.label).format('DD/MM')
        })
      })
      dats3?.map((d)=>{
        array4?.push({ 
          id:d?.id,
          value:d?.value,
          label:d?.m_nama,
          created_at:moment(d?.label).format('YYYY-MM-DD')
        })
      })
      return  {
        data:array,
        bar:array3,
        rank:array4,
         kategori:array2
        // query3,
        // query2,
        // query1,
        // query
       
        
      };
  }catch(error){
      console.log({error})
  }
}

async function barCharKuesionerSQ( 
  start,end,status
  ) {
     
  // let query = `
  // select b.m_name as label,count(b.m_name) as value  from t_note_to_pusat_kuesioner a
  // left join t_kategori_kuesioner2 b on b.id = a.kategori
  // where a.created_at between '${start} 00:00:01' and '${end} 23:59:59'
  // group by b.m_name
  // ` 
  let query = `
  select b.m_name as label,count(b.m_name) as value  
  from t_note_to_pusat_kuesioner a
  left join t_kategori_kuesioner2 b on b.id = a.kategori
  left join t_visit_sq2 c on a.id_visit = c.id
  where a.created_at between '${start} 00:00:01' and '${end} 23:59:59'
  and c.type LIKE '%${status}%'
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
    
  //   select ROW_NUMBER() OVER 
  //       (ORDER BY a.created_at desc) as row,a.m_note,a.m_tanggapan,a.created_at,b.m_name,c.type,e.m_nama as store from t_note_to_pusat_kuesioner a
  // left join t_kategori_kuesioner2 b on a.kategori = b.id
  // left join t_visit_sq2 c on a.id_visit = c.id
  // left join dbcmk.dbo.msstore_new d on d.m_kode COLLATE DATABASE_DEFAULT = c.store COLLATE DATABASE_DEFAULT
  // left join dbcmk.dbo.msmaster e on e.m_kode COLLATE DATABASE_DEFAULT = d.m_mall COLLATE DATABASE_DEFAULT
  let query = `
  select * from (
    
    select ROW_NUMBER() OVER 
    (ORDER BY a.created_at desc) as row,a.id,a.m_note,a.m_tanggapan,a.created_at,b.m_name,c.type,
    e.m_nama as store,d.m_city,f.m_nama as brand from t_note_to_pusat_kuesioner a
    left join t_kategori_kuesioner2 b on a.kategori = b.id
    left join t_visit_sq2 c on a.id_visit = c.id
    left join dbcmk.dbo.msstore_new d on d.m_kode COLLATE DATABASE_DEFAULT = c.store COLLATE DATABASE_DEFAULT
    left join (select * from dbcmk.dbo.msmaster where m_type='MALL') e on e.m_kode COLLATE DATABASE_DEFAULT = d.m_mall COLLATE DATABASE_DEFAULT
    left join (select * from dbcmk.dbo.msmaster where m_type='BRAND') f on f.m_kode COLLATE DATABASE_DEFAULT = d.m_brand COLLATE DATABASE_DEFAULT
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
async function sendEmailApprovedSQVisit( 
  email,type,data,visit
  ) {
    // @recipients='rafi.assidiq@centralmegakencana.com',
    let images = visit?.data?.image_visit?.split(',')
    let html = `
    <!DOCTYPE html>
    <html>
      <head>
      <style>
      table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
      }

      td, th {
        border: 1px solid #dddddd;
        text-align: left;
        padding: 8px;
      }

      
      </style>
      </head>
      <body>

      <h2>Visit store report ${visit?.data?.m_nama}</h2>
      <small>${visit?.data?.created_at.split('T')[0]}</small>
      <br/>
      <br/>
      <p>Nama JR : ${visit?.data?.jr_nama}</p>`
      html = html+  `
      <div style="display: flex;flex-direction: row;">
      <p>Tim SQ :</p> 
      <ul style="margin-left:-20px">
      `
      JSON.parse(visit?.data?.tim_sq).map((d)=>{
        html = html+  `
        <li>
          ${d.label}
        </li>
        `
      })
     
      html = html+  `
      </ul>
      </div>
      `
      html = html+  `
      <table>
        <tr>
           
          <th>Keterangan</th>
          <th>Yes</th>
          <th>No</th>
          <th>Note</th>
        </tr>`
        
        type?.map((t,i)=>{
           
        html = html+  ` <tr >
              <td style="  font-weight: bold;" colspan="4">  ${t?.m_nama} </td>
            
              
          </tr>`
          data?.map((d,j)=>{
            {t?.m_nama===d.m_nama?
            html = html+   ` <tr>
               
              <td >${d?.m_pernyataan}  </td>
              <td style="text-align: center;">
              ${d?.jwb?.includes('true')?"V":""}
              </td>
              <td style="text-align: center;">
              ${d?.jwb?.includes('false')?"V":""}
              </td>
              <td>
              ${d?.note}
              </td>
            </tr>`
            :null}
          })
        })
     html = html+`   
      </table>
      `
      // for(let i;images.length>i;i++){
        // html = html+ `<img src="https://api-dbticket.cmk.co.id/uploads/visit-sq/${images[0]}" alt="Girl in a jacket" width="300" height="300">`
      // }
      
      html = html+`<h2 style="margin-top:10px">Note To SM</h2>

      <table>
        <tr>
           
          <th>Keterangan</th>
          <th>Tanggapan</th>
           
        </tr>`
        
         
          data?.map((d,j)=>{
            {d?.jwb.includes('false')?
            html = html+   ` <tr>
               
              <td >${d?.m_pernyataan}  </td>
              
              <td>
              ${d?.m_feedback}
              </td>
            </tr>`:null}
          })
       
     html = html+`   
      </table>
      `  
      html = html+`<h2 style="margin-top:10px">Foto Kunjungan</h2>`
      images.map((d)=>{
         
        html = html+` 
     
        <img style="margin:10px;margin-top:10px" src="${d?.split('/').length>1?axs?.PATH_DOC+d:visit.path+d}" alt="Visit SQ" width="300" height="300">
      `
    })
     
      html=html+`  
      </body>
    </html>


    `
  let query = `
  EXEC msdb.dbo.sp_send_dbmail 
			@profile_name='sysadmin-new', 
			@recipients='${email}',
			@subject='Visit store report', 
			@body= '${html}',
			@body_format = 'HTML'
  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let datas = await pool.request().query(query);
     
      
      return  {
        data:datas?.recordsets[0]
      };
  }catch(error){
      console.log({error})
  }
}
async function sendEmailApprovedSQCall( 
  email,data,visit
  ) {
    // @recipients='rafi.assidiq@centralmegakencana.com',
    let images = visit?.data?.image_visit?.split(',')
    let html = `
    <!DOCTYPE html>
    <html>
      <head>
      <style>
      table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
      }

      td, th {
        border: 1px solid #dddddd;
        text-align: left;
        padding: 8px;
      }

      
      </style>
      </head>
      <body>

      <h2>Call store report ${visit?.data?.m_nama}</h2>
      <small>${visit?.data?.created_at.split('T')[0]}</small>
      <br/>
      <br/>
      <p>Penerima : ${visit?.data?.jr_nama}</p>`
      html = html+  `
      <div style="display: flex;flex-direction: row;">
      <p>Penelepon : ${JSON.parse(visit?.data?.tim_sq)[0]?.label}</p> 
     
      `
      // JSON.parse(visit?.data?.tim_sq).map((d)=>{
      //   html = html+  `
      //   <li>
      //     ${d.label}
      //   </li>
      //   `
      // })
     
      html = html+  `
      
      </div>
      `
     
      // for(let i;images.length>i;i++){
        // html = html+ `<img src="https://api-dbticket.cmk.co.id/uploads/visit-sq/${images[0]}" alt="Girl in a jacket" width="300" height="300">`
      // }
      
      html = html+`<h2 style="margin-top:10px">Current issues</h2>

      <table>
        <tr>
           
          <th>Keterangan</th>
          <th>Tanggapan</th>
          <th>Kategori</th>
           
        </tr>`
        
         
          data?.map((d,j)=>{
            
            html = html+   ` <tr>
               
              <td >${d?.m_note}  </td>
              
              <td>
              ${d?.m_tanggapan}
              </td>
              <td>
              ${d?.kategori?.label}
              </td>
            </tr>`
          })
       
     html = html+`   
      </table>
      `  
     
      html=html+`  
      </body>
    </html>


    `
  let query = `
  EXEC msdb.dbo.sp_send_dbmail 
			@profile_name='sysadmin-new', 
			@recipients='${email}',
			@subject='Call store report', 
			@body= '${html}',
			@body_format = 'HTML'
  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let datas = await pool.request().query(query);
     
      
      return  {
        data:datas?.recordsets[0]
        
      };
  }catch(error){
      console.log({error})
  }
}
async function listBudget( 
  page,limit,search
  ) {
    let last = limit*page
    let first = last - (limit-1)
  let query = `
  select * from(
    select ROW_NUMBER() OVER 
    (ORDER BY id asc) as row,b.m_nama,b.m_jabatan,a.* from t_budget_jamuan a 
    left join dbhrd.dbo.mskaryawan b on b.m_nik   = a.nik  
 
    `
    if(search!==''){
    query = query+` where b.m_nama like '%${search}%'`
  }
  query = query+` 
    ) as awek
     
    where row BETWEEN '${first}' AND '${last}'

  ` 
  let query1 = `
  select count(*) as tot from(
    select ROW_NUMBER() OVER 
    (ORDER BY id asc) as row,b.m_nama,b.m_jabatan,a.* from t_budget_jamuan a 
    left join dbhrd.dbo.mskaryawan b on b.m_nik   = a.nik  
`
if(search!==''){
  query1 = query1+`where b.m_nama like '%${search}%'`
}
    query1 = query1+` ) as awek`
   
    
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query1);
      
      return  {
        // query,query1,first,limit
        data:data?.recordsets[0],
        tot:tot.recordsets[0][0]['tot']
      };
  }catch(error){
      console.log({error})
  }
}
async function insertBudget( 
  nik,user,nominal
  ) {
     
  let query = `
  insert into t_budget_jamuan 
  (
   nik,
   nominal, 
   created_at, 
   updated_at,
   status_aktif
    
 )
  values (
  '${nik}',
  '${nominal}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
  'true'
  )

  ` 
   
  let query1 = `
  SELECT * FROM t_log_jamuan order by id desc
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      // let data = await pool.request().query(query);
      let getid = await pool.request().query(query1);
    //   let addlog = await pool.request().query(`
    //   insert into t_log_jamuan 
    //   (
    //    id_t_budget_jamuan,
    //    nominal, 
    //    status,
    //    type,
    //    keterangan,
    //    created_by,
    //    created_at, 
    //    updated_at
       
        
    //  )
    //   values (
    //   '${parseInt(getid?.recordsets[0][0]['id']?getid?.recordsets[0][0]['id']:0)+1}',
    //   '${nominal}',
    //   'D',
    //   'CREATE',
    //   'CREATE BUDGET',
    //   '${user}',
    //   '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
    //   '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
    //   )
    //   ` );
      return  {
        // data:data?.recordsets[0],
        getid:getid.recordsets[0],
        // addlog:addlog.recordsets[0]
       };
  }catch(error){
      console.log({error})
  }
}
async function notification(token) {
//   let query = `SELECT COUNT(*) as jumlah, m_nomor,
//   DATEDIFF(dd, m_tgl_pekerjaan, GETDATE()) as bedahari
//   from t_task_pic_new
//   where (m_status_pic != 'SETPIC' AND m_status_pic != 'DOING' and m_status_pic != 'DONE' and m_status_pic != 'APPROVE')
//   GROUP by DATEDIFF(dd, m_tgl_pekerjaan, GETDATE()), m_nomor`
//   let query1 = `SELECT COUNT(*) as jumlah, m_nomor,
//   DATEDIFF(dd, m_start_pic, GETDATE()) as bedahari
// from t_task_pic_new
// where (m_status_pic != 'DOING' and m_status_pic != 'DONE' and m_status_pic != 'APPROVE') AND (m_start_pic IS NOT NULL OR m_start_pic != '1900-01-01 00:00:00')
// GROUP by m_nomor, DATEDIFF(dd, m_start_pic, GETDATE())`
let queryBusdevDoing = `
SELECT COUNT(*) as jumlah, a.m_nomor,
DATEDIFF(dd, a.m_start_pic, GETDATE()) as bedahari
from t_task_pic_new a
left join t_task_new b on a.m_nomor = b.m_nomor
where (a.m_status_pic != 'DOING' and a.m_status_pic != 'DONE' and a.m_status_pic != 'APPROVE') AND (a.m_start_pic IS NOT NULL OR a.m_start_pic != '1900-01-01 00:00:00')
and b.m_kodeunit = '02'
GROUP by a.m_nomor, DATEDIFF(dd, a.m_start_pic, GETDATE())
`
let queryBusdevPic = `
SELECT COUNT(*) as jumlah, a.m_nomor,
  DATEDIFF(dd, a.m_tgl_pekerjaan, GETDATE()) as bedahari
  from t_task_pic_new a
  left join t_task_new b on a.m_nomor = b.m_nomor 
  where (a.m_status_pic != 'SETPIC' AND a.m_status_pic != 'DOING' and a.m_status_pic != 'DONE' and a.m_status_pic != 'APPROVE')
  and b.m_kodeunit = '02'
  GROUP by DATEDIFF(dd, a.m_tgl_pekerjaan, GETDATE()), a.m_nomor
`
let queryHCMPic = `
SELECT COUNT(*) as jumlah, a.m_nomor,
DATEDIFF(dd, a.m_tgl_pekerjaan, GETDATE()) as bedahari
from t_task_pic_new a
left join t_task_new b on b.m_nomor = a.m_nomor
where (a.m_status_pic != 'SETPIC' AND a.m_status_pic != 'DOING' and a.m_status_pic != 'DONE' and a.m_status_pic != 'APPROVE')
AND b.m_kodeunit = '03'
GROUP by DATEDIFF(dd, a.m_tgl_pekerjaan, GETDATE()) , a.m_nomor
`
let queryITPic = `
SELECT COUNT(*) as jumlah, a.m_nomor,
DATEDIFF(dd, a.m_tgl_pekerjaan, GETDATE()) as bedahari
from t_task_pic_new a
left join t_task_new b on b.m_nomor = a.m_nomor
where (a.m_status_pic != 'SETPIC' AND a.m_status_pic != 'DOING' and a.m_status_pic != 'DONE' and a.m_status_pic != 'APPROVE')
AND (b.m_kodeunit = '07' OR b.m_kodeunit = '04')
GROUP by DATEDIFF(dd, a.m_tgl_pekerjaan, GETDATE()) , a.m_nomor
`

let queryIAPic = `
SELECT COUNT(*) as jumlah, a.m_nomor,
DATEDIFF(dd, a.m_tgl_pekerjaan, GETDATE()) as bedahari
from t_task_pic_new a
left join t_task_new b on b.m_nomor = a.m_nomor
where (a.m_status_pic != 'SETPIC' AND a.m_status_pic != 'DOING' and a.m_status_pic != 'DONE' and a.m_status_pic != 'APPROVE')
AND b.m_kodeunit = '05'
GROUP by DATEDIFF(dd, a.m_tgl_pekerjaan, GETDATE()) , a.m_nomor
`
let queryQMSPic = `
SELECT COUNT(*) as jumlah, a.m_nomor,
DATEDIFF(dd, a.m_tgl_pekerjaan, GETDATE()) as bedahari
from t_task_pic_new a
left join t_task_new b on b.m_nomor = a.m_nomor
where (a.m_status_pic != 'SETPIC' AND a.m_status_pic != 'DOING' and a.m_status_pic != 'DONE' and a.m_status_pic != 'APPROVE')
AND b.m_kodeunit = '06'
GROUP by DATEDIFF(dd, a.m_tgl_pekerjaan, GETDATE()) , a.m_nomor
`
let queryHRRPic = `
SELECT COUNT(*) as jumlah, a.m_nomor,
DATEDIFF(dd, a.m_tgl_pekerjaan, GETDATE()) as bedahari
from t_task_pic_new a
left join t_task_new b on b.m_nomor = a.m_nomor
where (a.m_status_pic != 'SETPIC' AND a.m_status_pic != 'DOING' and a.m_status_pic != 'DONE' and a.m_status_pic != 'APPROVE')
AND b.m_kodeunit = '08'
GROUP by DATEDIFF(dd, a.m_tgl_pekerjaan, GETDATE()) , a.m_nomor
`
  try{
      let pool = await sql.connect(configTICKET);
      // let reset = await pool.request().query(`exec sp_notif '${userlogin}' `);
     let res  = await axs.NET("POST", 
     `${axs.BASE_LOGIN}/notification-portal`, {
      
     },token)
     let res2  = await axs.NET("POST", 
     `${axs.BASE_BUDGET}/notif-approve-atasan`, {
      
     },token)
     let res3  = await axs.NET("POST", 
     `${axs.BASE_BUDGET}/notif-approve-pemilik`, {
      
     },token)
     let res4  = await axs.NET("POST", 
     `${axs.BASE_BUDGET}/notif-approve-kasir`, {
      
     },token)
     let dataQueryBusdevDoing = await pool.request().query(queryBusdevDoing);
     let dataQueryBusdevPic = await pool.request().query(queryBusdevPic);
     let dataQueryHCMvPic = await pool.request().query(queryHCMPic);
     let dataQueryITPic = await pool.request().query(queryITPic);
     let dataQueryIAPic = await pool.request().query(queryIAPic);
     let dataQueryQMSPic = await pool.request().query(queryQMSPic);
     let dataQueryHRRPic = await pool.request().query(queryHRRPic);
    //  let dataQuery = await pool.request().query(query);
    //  let dataQuery1 = await pool.request().query(query1); 
    //  let notif1 = res?.data?.data
     let notifPortal = res?.data?.data
     let notifBudgetApprovalAtasan = res2?.data?.data?.data
     let notifBudgetApprovalPemilik = res3?.data?.data?.data
     let notifBudgetApprovalkasir = res4?.data?.data?.data
    //  let notif2 = dataQuery.recordsets[0]
    //  let notif3 = dataQuery1.recordsets[0]
    
    return  {
      notifPortal,
      notifBudgetApprovalAtasan,
      notifBudgetApprovalPemilik,
      notifBudgetApprovalkasir,
      notifBusdevDoing:dataQueryBusdevDoing?.recordsets[0],
      notifBusdevPic:dataQueryBusdevPic?.recordsets[0],
      notifHMCPic:dataQueryHCMvPic?.recordsets[0],
      notifITPic:dataQueryITPic?.recordsets[0],
      notifIAPic:dataQueryIAPic?.recordsets[0],
      notifQMSPic:dataQueryQMSPic?.recordsets[0],
      notifHRRPic:dataQueryHRRPic?.recordsets[0]

    };
      // return  {notif1,notif2,notif3};
  }catch(error){
      console.log(error);
  }
}
async function notificationDetailEntryRequest(kode) {
  let query = `select m_nomor as nomor, convert(
      varchar(10), 
      m_tgl_pekerjaan, 
      105
  ) as tanggal_mulai,
  m_keterangan
  from t_task_pic_new where m_nomor = '${kode}' and (m_status_pic != 'SETPIC' 
  AND m_status_pic != 'DOING' and m_status_pic != 'DONE' 
  and m_status_pic != 'APPROVE')`
 
  try{
      let pool = await sql.connect(configTICKET);
      // let reset = await pool.request().query(`exec sp_notif '${userlogin}' `);
   
     let dataQuery = await pool.request().query(query);
 
     let data = dataQuery?.recordsets[0]
   

      return  {data};
  }catch(error){
      console.log(error);
  }
}
async function listKategoriLegalitas( 
  page,limit,search
  ) {
    let last = limit*page
    let first = last - (limit-1)
  let query = `
  select * from(
    select ROW_NUMBER() OVER 
    (ORDER BY id asc) as row,* from t_kategori_legalitas
     
 
    `
    if(search!==''){
    query = query+` where nama like '%${search}%'`
  }
  query = query+` 
    ) as awek
     
    where row BETWEEN '${first}' AND '${last}'

  ` 
  let query1 = `
  select count(*) as tot from(
    select ROW_NUMBER() OVER 
    (ORDER BY id asc) as row,* from t_kategori_legalitas
`
if(search!==''){
  query1 = query1+`where nama like '%${search}%'`
}
    query1 = query1+` ) as awek`
   
    
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query1);
      
      return  {
        // query,query1,first,limit
        data:data?.recordsets[0],
        tot:tot.recordsets[0][0]['tot']
      };
  }catch(error){
      console.log({error})
  }
}
async function listBangunanPenunjangLegalitas( 
  page,limit,search,type,kategori,status
  ) {
    let last = limit*page
    let first = last - (limit-1)
  let query = `
  select * from(
    select ROW_NUMBER() OVER 
    (ORDER BY a.id asc) as row,a.*,b.nama as kategori from t_bangunan_penunjang_legalitas a
    join t_kategori_legalitas b on b.id= a.id_kategori
     where b.type = '${type}'
 
    `
    if(search!==''){
    query = query+` and a.nama like '%${search}%'`
  }
  if(kategori!==''){
    query = query+` and a.id_kategori = '${kategori}'`
  }
  if(status!==''){
    query = query+` and (a.end_date ${status==='expired'?'<=':'>='} '${moment(new Date()).format('YYYY-MM-DD')+' 00:00:00'}'
    ${status==='expired'?"and a.end_date !='1995-12-19 00:00:00'":"OR a.end_date ='1995-12-19 00:00:00')"}`
  }
  query = query+` 
    ) as awek
     
    where row BETWEEN '${first}' AND '${last}'

  ` 
  let query1 = `
  select count(*) as tot from(
    select ROW_NUMBER() OVER 
    (ORDER BY a.id asc) as row,a.*,b.nama as kategori from t_bangunan_penunjang_legalitas a
    join t_kategori_legalitas b on b.id= a.id_kategori
    where b.type = '${type}'
`
if(search!==''){
  query1 = query1+`and a.nama like '%${search}%'`
}
if(kategori!==''){
  query1 = query1+` and a.id_kategori = '${kategori}'`
}
    query1 = query1+` ) as awek`
   
    
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query1);
      
      return  {
        // query,
        // query1,first,limit
        data:data?.recordsets[0],
        tot:tot.recordsets[0][0]['tot'],
        path:axs.PATH_TICKET+'/uploads/bangunan-penunjang/'
      };
  }catch(error){
      console.log({error})
  }
}
async function listKompetensiLegalitas( 
  page,limit,search,status
  ) {
    let last = limit*page
    let first = last - (limit-1)
  let query = `
  select * from(
    select ROW_NUMBER() OVER 
    (ORDER BY id asc) as row,a.*,b.m_nama,b.m_jabatan  from t_kompetensi_legalitas a
join dbhrd.dbo.mskaryawan b on b.m_nik = a.nik
 
     
 
    `
    if(search!==''){
    query = query+` where b.m_nama like '%${search}%'`
  }
  if(status!==''){
    query = query+` and a.end_date ${status==='expired'?'<=':'>='} '${moment(new Date()).format('YYYY-MM-DD')+' 00:00:00'}'`
  }
  query = query+` 
    ) as awek
     
    where row BETWEEN '${first}' AND '${last}'

  ` 
  let query1 = `
  select count(*) as tot from(
    select ROW_NUMBER() OVER 
    (ORDER BY id asc) as row,a.*,b.m_nama,b.m_jabatan  from t_kompetensi_legalitas a
join dbhrd.dbo.mskaryawan b on b.m_nik = a.nik
 
`
if(search!==''){
  query1 = query1+`where b.m_nama like '%${search}%'`
}
    query1 = query1+` ) as awek`
   
    
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query1);
      
      return  {
        // query,query1,first,limit
        data:data?.recordsets[0],
        tot:tot.recordsets[0][0]['tot'],
        path:axs.PATH_TICKET+'/uploads/kompetensi/'
      };
  }catch(error){
      console.log({error})
  }
}
async function insertKategoriLegalitas( 
  nama,type
  ) {
     
  let query = `
  insert into t_kategori_legalitas 
  (
   nama,
   type, 
   created_at, 
   updated_at 
    
 )
  values (
  '${nama}',
  '${type}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}' 
  )

  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
     
      return  {
        data:data?.recordsets[0],
        // getid:getid.recordsets[0],
        // addlog:addlog.recordsets[0]
       };
  }catch(error){
      console.log({error})
  }
}
async function updateKategoriLegalitas( 
  id,nama,type
  ) {
     
  let query = `
  update 	t_kategori_legalitas 
  set  
  nama = '${nama}', 
  type = '${type}', 
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
async function insertBangunanPenunjangLegalitas( 
  nama,kategori,izin,
      penerbit,start,end,keterangan,doc
  ) {
     
  let query = `
  insert into t_bangunan_penunjang_legalitas 
  (
   nama,
   id_kategori, 
   no_izin, 
   penerbit, 
   start_date, 
   end_date, 
   keterangan,  
   created_at, 
   updated_at,
   issend,
   doc 
    
 )
  values (
  '${nama}',
  '${kategori}',
  '${izin}',
  '${penerbit}',
  '${start}',
  '${end}',
  '${keterangan}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
  'false',
  '${doc}'
  )

  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
     
      return  {
        data:data?.recordsets[0],
        // getid:getid.recordsets[0],
        // addlog:addlog.recordsets[0]
       };
  }catch(error){
      console.log({error})
  }
}
async function updateBangunanPenunjangLegalitas( 
  id,nama,kategori,izin,
  penerbit,start,end,keterangan,issend,doc,a
  ) {
     
  let query = `
  update 	t_bangunan_penunjang_legalitas 
  set  
  nama = '${nama}',
  id_kategori = '${kategori}', 
  no_izin = '${izin}', 
  penerbit = '${penerbit}', 
  start_date = '${start}', 
  end_date = '${end}', 
  keterangan = '${keterangan}',   
  issend = '${issend}',`
  if(a){
    query = query+` doc = '${doc}',` 
   
  }
  
  query = query+` updated_at = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
  
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
async function insertKompetensiLegalitas( 
  nik,no_sertif,nama_sertif,
      penerbit,start,end,aspek,doc
  ) {
     
  let query = `
  insert into t_kompetensi_legalitas 
  (
   nik,
   no_sertifikat, 
   nama_sertifikat, 
   penerbit, 
   start_date, 
   end_date, 
   aspek,  
   created_at, 
   updated_at,
   issend,
   doc 
    
 )
  values (
  '${nik}',
  '${no_sertif}',
  '${nama_sertif}',
  '${penerbit}',
  '${start}',
  '${end}',
  '${aspek}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
  'false',
  '${doc}' 
  )

  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
     
      return  {
        data:data?.recordsets[0],
        // getid:getid.recordsets[0],
        // addlog:addlog.recordsets[0]
       };
  }catch(error){
      console.log({error})
  }
}
async function updateKompetensiLegalitas( 
  id,nik,no_sertif,nama_sertif,
  penerbit,start,end,aspek,issend,doc,a
  ) {
     
  let query = `
  update 	t_kompetensi_legalitas 
  set  
   nik = '${nik}',
   no_sertifikat = '${no_sertif}', 
   nama_sertifikat = '${nama_sertif}', 
   penerbit = '${penerbit}', 
   start_date = '${start}', 
   end_date = '${end}', 
   aspek = '${aspek}',  
   `
   if(a){
     query = query+` doc = '${doc}',` 
    
   }
   query = query+` issend = '${issend}',
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
async function getKategoriLegalitas( 
  nama,type
  ) {
     
  let query = `
  select TOP 5 id as value, nama as label from t_kategori_legalitas
  where 	type = '${type}'
  and nama like '%${nama}%'
  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
     
      
      return  {data:data?.recordsets[0] };
  }catch(error){
      console.log({error})
  }
}
async function countBangunanPenunjang( 
  ) {
     
  let query = `
  select  b.nama as kategori,b.type,a.* from t_bangunan_penunjang_legalitas a
  join t_kategori_legalitas b on a.id_kategori = b.id
  where a.issend='false'
  and a.end_date BETWEEN '${moment(new Date()).format('YYYY-MM-DD')} 00:00:00' and '${moment().add(2, 'months').format('YYYY-MM-DD')+' 00:00:00'}'
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
async function sendEmailReminderBangunanPenunjangLegalitas( 
  data
  ) {
   
   
    let html = `
    <!DOCTYPE html>
    <html>
      <head>
      <style>
      table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
      }

      td, th {
        border: 1px solid #dddddd;
        text-align: left;
        padding: 8px;
      }

      
      </style>
      </head>
      <body>

      <h2>Bangunan, Penunjang Produksi, Infra & LH</h2>

      <table>
      <tr>
         
        <th>Kategori</th>
        <th>Type</th>
        <th>Nama</th>
        <th>No. Izin</th>
        <th>Penerbit</th>
        <th>Tanggal mulai</th>
        <th>Tanggal selesai</th>
        <th>Keterangan</th>
      </tr>`
      
       
        data?.map((d,j)=>{
       
          html = html+   ` <tr>
             
            <td >${d?.kategori}  </td>
            
            <td> ${d?.type} </td>
            <td> ${d?.nama} </td>
            <td> ${d?.no_izin} </td>
            <td> ${d?.penerbit} </td>
            <td> ${moment(d?.start_date).format('YYYY-MM-DD')} </td>
            <td> ${moment(d?.end_date).format('YYYY-MM-DD')} </td>
            <td> ${d?.keterangan} </td>
          </tr>` 
        })
     
   html = html+`   
    </table>
      `

      html=html+`  
      </body>
    </html>
    `
  let query = `
  EXEC msdb.dbo.sp_send_dbmail 
			@profile_name='sysadmin-new', 
			@recipients='rafi.assidiq@centralmegakencana.co.id',
			@subject='Pengingat jatuh tempo', 
			@body= '${html}',
			@body_format = 'HTML'
  ` 
  let query1 = `
  EXEC msdb.dbo.sp_send_dbmail 
			@profile_name='sysadmin-new', 
			@recipients='lisa.lijanto@centralmegakencana.co.id',
			@subject='Pengingat jatuh tempo', 
			@body= '${html}',
			@body_format = 'HTML'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let datas = await pool.request().query(query);
      let datas1 = await pool.request().query(query1);
      data?.map(async(d,j)=>{
         await pool.request().query(`
         update t_bangunan_penunjang_legalitas set
          issend = 'true',
          updated_at = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
          where id = '${d?.id}' 
         
         `);
      })
      return  {
        datar:datas?.recordsets[0],
        data
      };
  }catch(error){
      console.log({error})
  }
}
async function getKompetensiSendmail( 
  ) {
     
  let query = `
  
  select c.m_emailkantor,a.*,b.m_nama,b.m_jabatan from t_kompetensi_legalitas a
  join dbhrd.dbo.mskaryawan b on a.nik = m_nik
  join dbhrd.dbo.msemailkaryawan c on a.nik = c.m_nik
  where a.issend = 'false'
  and a.end_date BETWEEN '${moment(new Date()).format('YYYY-MM-DD')} 00:00:00' and '${moment().add(2, 'months').format('YYYY-MM-DD')+' 00:00:00'}'
  ` 
  let query1 = `
  
  select distinct(c.m_emailkantor) from t_kompetensi_legalitas a
  join dbhrd.dbo.mskaryawan b on a.nik = m_nik
  join dbhrd.dbo.msemailkaryawan c on a.nik = c.m_nik
  where a.issend = 'false'
  and a.end_date BETWEEN '${moment(new Date()).format('YYYY-MM-DD')} 00:00:00' and '${moment().add(2, 'months').format('YYYY-MM-DD')+' 00:00:00'}'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let data1= await pool.request().query(query1);
      
      return  {
        data:data?.recordsets[0] ,
        data1:data1?.recordsets[0] 
        // query
      };
  }catch(error){
      console.log({error})
  }
}
async function sendEmailKompetensiLegalitas( 
  data
  ) {
   
   
    let html = `
    <!DOCTYPE html>
    <html>
      <head>
      <style>
      table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
      }

      td, th {
        border: 1px solid #dddddd;
        text-align: left;
        padding: 8px;
      }

      
      </style>
      </head>
      <body>

      <h2>Kompetensi HSE - Karyawan</h2>

      <table>
      <tr>
         
        <th>Nama</th>
        <th>Jabatan</th>
        <th>Nomor Sertifikat</th>
        <th>Nama Sertifikat</th>
        <th>Penerbit</th>
        <th>Aspek</th>
        <th>Tanggal mulai</th>
        <th>Tanggal selesai</th>

      </tr>`
      
       
        data?.data?.map((d,j)=>{
       
          html = html+   ` <tr>
             
            <td >${d?.m_nama}  </td>
            
            <td> ${d?.m_jabatan} </td>
            <td> ${d?.no_sertifikat} </td>
            <td> ${d?.nama_sertifikat} </td>
            <td> ${d?.penerbit} </td>
            <td> ${d?.aspek} </td>
            <td> ${moment(d?.start_date).format('YYYY-MM-DD')} </td>
            <td> ${moment(d?.end_date).format('YYYY-MM-DD')} </td>
           
          </tr>` 
        })
     
   html = html+`   
    </table>
      `

      html=html+`  
      </body>
    </html>
    `
  let query = `
  EXEC msdb.dbo.sp_send_dbmail 
			@profile_name='sysadmin-new', 
			@recipients='${data?.email}',
			@subject='Pengingat jatuh tempo kompetensi', 
			@body= '${html}',
			@body_format = 'HTML'
  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let datas = await pool.request().query(query);
       
      data?.data?.map(async(d,j)=>{
         await pool.request().query(`
         update t_kompetensi_legalitas set
          issend = 'true',
          updated_at = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
          where id = '${d?.id}' 
         
         `);
      })
      return  {
        datar:datas?.recordsets[0],
        data
      };
  }catch(error){
      console.log({error})
  }
}

async function deleteVisitSq(id 
  ) {
  let query1 = `
    delete  t_visit_sq2 where id = '${id}'
  ` 
  let query2 = `
    delete  t_jawaban_visit where id_visit = '${id}'
  ` 
  let query3 = `
  delete  t_note_to_pusat_kuesioner where id_visit = '${id}'
` 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query1); 
      let data2 = await pool.request().query(query2); 
      let data3 = await pool.request().query(query3); 
      return  {data:data.recordsets[0]};
  }catch(error){
      console.log({error})
  }
}
async function changeFpp( 
  id
  ) {
     
  let query = `
  update dbalat.dbo.t_reqpurch_app set 
  m_nik = '220657'
  where m_nomor = '${id}' and m_nik = '130408'
  ` 
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
     
      
      return  {data:data?.recordsets[0] };
  }catch(error){
      console.log({error})
  }
} 
async function getListStatusTiketing( 
  page,limit
  ) {
    let last = limit*page
    let first = last - (limit-1) 
  let query = `
  select*from(
    select 
    `
    if(page!==''&&limit!==''){
      query = query+`ROW_NUMBER() OVER 
          (ORDER BY id asc) as row
        ,* 
        `
    }else{
      query = query+`id as value, name as label,color
    
    `
    }
    query = query+`  
        from msticket_status  
    `
   
    query = query+`  
    ) awek`
    if(page!==''&&limit!==''){
    query = query+`  
    where row BETWEEN '${first}' AND '${last}'
  ` }
  let query1 = `
  select count(*) as tot from(
    select ROW_NUMBER() OVER 
    (ORDER BY id asc) as row
  ,*  from msticket_status  
    `
    
    query1 = query1+`  
    ) awek`
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query1);
      
      return  {
        data:data?.recordsets[0],
        // query1,query
        tot:tot.recordsets[0][0]['tot']
        // query,page,limit,search1,search2,type
      };
  }catch(error){
      console.log({error})
  }
}

async function insertStatusTiketing(name,color,m_type,token
  ) {
  let query = `
  insert into msticket_status (name,color,m_type)
  values ('${name}', '${color}', '${m_type}')
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-status-tiketing',type:'INSERT',param:JSON.stringify({name,color,m_type}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-status-tiketing',type:'INSERT',param:JSON.stringify({name,color,m_type}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {name,color,m_type};
  }catch(error){
      console.log({error})
  }
}

async function updateStatusTiketing(id,name,color,m_type,token) {
  let query = `
    update 	msticket_status 
		set  name = '${name}', 
    color = '${color}', 
    m_type = '${m_type}'
    where 	id = '${id}'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'update-status-tiketing',type:'UPDATE',param:JSON.stringify({id,name,color,m_type}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'update-status-tiketing',type:'UPDATE',param:JSON.stringify({id,name,color,m_type}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {id,name,color,m_type};
  }catch(error){
      console.log({error})
  }
}
async function deleteStatusTiketing(id,token) {
  let query = `
    delete from 	msticket_status 
    where 	id = '${id}'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'delete-status-tiketing',type:'DELETE',param:JSON.stringify({id}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'delete-status-tiketing',type:'DELETE',param:JSON.stringify({id}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {id};
  }catch(error){
      console.log({error})
  }
}
async function getListCategoriesUser( 
  page,limit
  ) {
    let last = limit*page
    let first = last - (limit-1) 
  let query = `
  select*from(
    select ROW_NUMBER() OVER 
          (ORDER BY a.id asc) as row
        ,a.*,b.m_nama,c.name  from msticket_categories_users  a
        join dbhrd.dbo.mskaryawan b on a.id_user=b.m_nik
        join msticket_categories c on a.id_category=c.id
    `
   
    query = query+`  
    ) awek
    
    where row BETWEEN '${first}' AND '${last}'
  ` 
  let query1 = `
  select count(*) as tot from(
    select ROW_NUMBER() OVER 
    (ORDER BY a.id asc) as row
    ,a.*,b.m_nama,c.name   from msticket_categories_users  a
  join dbhrd.dbo.mskaryawan b on a.id_user=b.m_nik
  join msticket_categories c on a.id_category=c.id
    `
    
    query1 = query1+`  
    ) awek`
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query1);
      
      return  {
        data:data?.recordsets[0],
        // query1,query
        tot:tot.recordsets[0][0]['tot']
        // query,page,limit,search1,search2,type
      };
  }catch(error){
      console.log({error})
  }
}

async function insertCategoriesUser(category,user,token) {
  let query = `
  insert into msticket_categories_users (id_category,id_user)
  values ('${category}', '${user}')
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-categories-user',type:'INSERT',param:JSON.stringify({id_category:category,id_user:user}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-categories-user',type:'INSERT',param:JSON.stringify({id_category:category,id_user:user}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {category,user};
  }catch(error){
      console.log({error})
  }
}
async function updateCategoriesUser(id,category,user,token) {
  let query = `
    update 	msticket_categories_users 
		set  id_category = '${category}',
    id_user = '${user}'
    where id= '${id}'
  `  
    
     	
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'update-categories-user',type:'UPDATE',param:JSON.stringify({id,id_category:category,id_user:user}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'update-categories-user',type:'UPDATE',param:JSON.stringify({id,id_category:category,id_user:user}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {id,category,user};
  }catch(error){
      console.log({error})
  }
}
async function deleteCategoriesUser(id,token) {
  let query = `
    delete from 	msticket_categories_users 
    where 	id = '${id}' 
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'delete-categories-user',type:'DELETE',param:JSON.stringify({id}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'delete-categories-user',type:'DELETE',param:JSON.stringify({id}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {id};
  }catch(error){
      console.log({error})
  }
}
async function getListTiketingCategories( 
  page,limit
  ) {
    let last = limit*page
    let first = last - (limit-1) 
  let query = `
  select*from( 
    select
    `
    if(page!==''&&limit!==''){
      query = query+`ROW_NUMBER() OVER 
          (ORDER BY a.id asc) as row
        ,a.* ,e.m_divisi+'-'+c.m_subdivisi as m_subdivisi
        `
    }else{
      query = query+`a.id as value, name as label
    
    `
    }
    query = query+`
        from msticket_categories  a
        left join msticket_unit_bisnis b on a.id_unit_bisnis = b.id
        left join dbhrd.dbo.mssubdivisi c on c.m_idsubdiv = b.m_unit
        join dbhrd.dbo.msdivisi e on b.m_dept = e.m_iddivisi
        
    `
   
    query = query+`  
    ) awek
    `
    if(page!==''&&limit!==''){
    query = query+ `
    where row BETWEEN '${first}' AND '${last}'
  ` 
}
  let query1 = `
  select count(*) as tot from(
    select ROW_NUMBER() OVER 
    (ORDER BY a.id asc) as row
        ,a.* ,c.m_subdivisi
         from msticket_categories a
         left join msticket_unit_bisnis b on a.id_unit_bisnis = b.id
         left join dbhrd.dbo.mssubdivisi c on c.m_idsubdiv = b.m_unit
    `
    
    query1 = query1+`  
    ) awek`
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query1);
      
      return  {
        data:data?.recordsets[0],
        // query1,query
        tot:tot.recordsets[0][0]['tot']
        // query,page,limit,search1,search2,type
      };
  }catch(error){
      console.log({error})
  }
}

async function insertTiketingCategories(name,color,id_unit_bisnis,token
  ) {
  let query = `
  insert into msticket_categories (name,color,id_unit_bisnis)
  values ('${name}', '${color}', '${id_unit_bisnis}')
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-tiketing-categories',type:'INSERT',param:JSON.stringify({name,color,id_unit_bisnis}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-tiketing-categories',type:'INSERT',param:JSON.stringify({name,color,id_unit_bisnis}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {name,color,id_unit_bisnis};
  }catch(error){
      console.log({error})
  }
}

async function updateTiketingCategories(id,name,color,id_unit_bisnis,token) {
  let query = `
    update 	msticket_categories 
		set  name = '${name}', 
    color = '${color}',
    id_unit_bisnis = '${id_unit_bisnis}'
    
    where 	id = '${id}'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'update-tiketing-categories',type:'UPDATE',param:JSON.stringify({id,name,color,id_unit_bisnis}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'update-tiketing-categories',type:'UPDATE',param:JSON.stringify({id,name,color,id_unit_bisnis}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {id,name,color,id_unit_bisnis};
  }catch(error){
      console.log({error})
  }
}

async function deleteCategoriesTiketing(id,token) {
  let query = `
    delete from 	msticket_categories
    where 	id = '${id}'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
         await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'delete-tiketing-categories',type:'DELETE',param:JSON.stringify({id}),apps:'CMK-HELPDESK',status:'berhasil'},token)
      }else{
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'delete-tiketing-categories',type:'DELETE',param:JSON.stringify({id}),apps:'CMK-HELPDESK',status:'gagal'},token)
      }
      return  {id};
  }catch(error){
      console.log({error})
  }
}
async function selectCategories( 
  search,unit
  ) {
      let query = `SELECT top 5 id as value,name as label FROM msticket_categories
      where   name LIKE '%${search}%' `
      if(unit!==''){
        query += ` and id_unit_bisnis = '${unit}'`
      }
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      let dats = data?.recordsets[0]
     
      return  {
        data:dats
        // query
      };
  }catch(error){
      console.log({error})
  }
}
async function getListTiketingPIC( 
  page,limit
  ) {
    let last = limit*page
    let first = last - (limit-1) 
  let query = `
  select*from( 
    select
    `
    if(page!==''&&limit!==''){
      query = query+`ROW_NUMBER() OVER 
          (ORDER BY a.id asc) as row
        ,a.*,c.m_nama,e.m_divisi+'-'+d.m_subdivisi as m_subdivisi
        `
    }else{
      query = query+`a.id as value, c.m_nama as label
    
    `
    }
    query = query+`
        from msticket_pic  a
         
        left join msticket_unit_bisnis b on a.unit_bisnis = b.id
        left join dbhrd.dbo.mskaryawan c on a.m_nik = c.m_nik
        left join dbhrd.dbo.mssubdivisi d on d.m_idsubdiv = b.m_unit
        join dbhrd.dbo.msdivisi e on b.m_dept = e.m_iddivisi
    `
   
    query = query+`  
    ) awek
    `
    if(page!==''&&limit!==''){
    query = query+ `
    where row BETWEEN '${first}' AND '${last}'
  ` 
}
  let query1 = `
  select count(*) as tot from(
    select ROW_NUMBER() OVER 
    (ORDER BY a.id asc) as row
        ,a.*,c.m_nama,d.m_subdivisi
         from msticket_pic a
         left join msticket_unit_bisnis b on a.unit_bisnis = b.id
         left join dbhrd.dbo.mskaryawan c on a.m_nik = c.m_nik
         left join dbhrd.dbo.mssubdivisi d on d.m_idsubdiv = b.m_unit
    `
    
    query1 = query1+`  
    ) awek`
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query1);
      
      return  {
        data:data?.recordsets[0],
        // query1,query
        tot:tot.recordsets[0][0]['tot']
        // query,page,limit,search1,search2,type
      };
  }catch(error){
      console.log({error})
  }
}

async function insertTiketingPIC(m_nik,unit_bisnis,m_type,token
  ) {
  let query = `
  insert into msticket_pic (m_nik,unit_bisnis,m_type,created_at,updated_at)
  values ('${m_nik}', '${unit_bisnis}','${m_type}' ,'${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}','${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}')
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-tiketing-pic',type:'INSERT',param:JSON.stringify({m_nik,unit_bisnis,m_type}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-tiketing-pic',type:'INSERT',param:JSON.stringify({m_nik,unit_bisnis,m_type}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {m_nik,unit_bisnis};
  }catch(error){
      console.log({error})
  }
}

async function updateTiketingPIC(id,m_nik,unit_bisnis,m_type,token) {
  let query = `
    update 	msticket_pic set  
    m_nik = '${m_nik}', 
    unit_bisnis = '${unit_bisnis}',
    m_type = '${m_type}'
    where 	id = '${id}'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'update-tiketing-pic',type:'UPDATE',param:JSON.stringify({id,m_nik,unit_bisnis,m_type}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'update-tiketing-pic',type:'UPDATE',param:JSON.stringify({id,m_nik,unit_bisnis,m_type}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {id,m_nik,unit_bisnis};
  }catch(error){
      console.log({error})
  }
}

async function deletePICTiketing(id,token) {
  let query = `
    delete from 	msticket_pic
    where 	id = '${id}'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
         await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'delete-tiketing-pic',type:'DELETE',param:JSON.stringify({id}),apps:'CMK-HELPDESK',status:'berhasil'},token)
      }else{
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'delete-tiketing-pic',type:'DELETE',param:JSON.stringify({id}),apps:'CMK-HELPDESK',status:'gagal'},token)
      }
      return  {id};
  }catch(error){
      console.log({error})
  }
}
async function getListUnitBisnis( 
  page,limit
  ) {
    let last = limit*page
    let first = last - (limit-1) 
  let query = `
  select*from( 
    select
    `
    if(page!==''&&limit!==''){
      query = query+`ROW_NUMBER() OVER 
          (ORDER BY id asc) as row
        ,a.* ,b.m_cabang as cabang,c.m_departemen as div,d.m_subdivisi as subdiv,e.m_divisi as dept,f.m_subdivisi as unit
        `
    }else{
      query = query+`a.id as value, e.m_divisi+'-'+f.m_subdivisi as label
    
    `
    }
    query = query+`
        from msticket_unit_bisnis a`
        if(page!==''&&limit!==''){
       query += `
        join dbhrd.dbo.mscabang b on a.m_cabang = b.m_idcabang
        join dbhrd.dbo.msdepartemen c on a.m_div = c.m_iddept
        join dbhrd.dbo.mssubdivisinew d on a.m_subdiv = d.m_idsubdiv
        join dbhrd.dbo.msdivisi e on a.m_dept = e.m_iddivisi
        join dbhrd.dbo.mssubdivisi f on a.m_unit = f.m_idsubdiv
        
    `
        }else{
          query +=` 
          join dbhrd.dbo.msdivisi e on a.m_dept = e.m_iddivisi
          join dbhrd.dbo.mssubdivisi f on a.m_unit = f.m_idsubdiv
          
          `
        }
    query = query+`  
    ) awek
    `
    if(page!==''&&limit!==''){
    query = query+ `
    where row BETWEEN '${first}' AND '${last}'
  ` 
}
  let query1 = `
  select count(*) as tot from(
    select ROW_NUMBER() OVER 
    (ORDER BY id asc) as row
  ,*  from msticket_unit_bisnis  
    `
    
    query1 = query1+`  
    ) awek`
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query1);
      
      return  {
        data:data?.recordsets[0],
        // query1,
        // query,
        tot:tot.recordsets[0][0]['tot']
        // query,page,limit,search1,search2,type
      };
  }catch(error){
      console.log({error})
  }
}

async function insertUnitBisnis(
  m_cabang,m_div,m_subdiv,m_dept,m_unit
  ,token
  ) {
  let query = `
  insert into msticket_unit_bisnis (m_cabang,m_div,m_subdiv,m_dept,m_unit,created_at,updated_at)
  values ('${m_cabang}', '${m_div}', '${m_subdiv}','${m_dept}','${m_unit}','${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}','${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}')
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-unit-bisnis',type:'INSERT',param:JSON.stringify({m_cabang,m_div,m_subdiv,m_dept,m_unit}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-unit-bisnis',type:'INSERT',param:JSON.stringify({m_cabang,m_div,m_subdiv,m_dept,m_unit}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {m_cabang,m_div,m_subdiv,m_dept,m_unit};
  }catch(error){
      console.log({error})
  }
}

async function updateUnitBisnis(id,m_cabang,m_div,m_subdiv,m_dept,m_unit,token) {
  let query = `
    update 	msticket_unit_bisnis 
		set  
    m_cabang = '${m_cabang}', 
    m_div = '${m_div}',
    m_subdiv = '${m_subdiv}',
    m_dept = '${m_dept}',
    m_unit = '${m_unit}',
    updated_at= '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
    
    where 	id = '${id}'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'update-unit-bisnis',type:'UPDATE',param:JSON.stringify({id,m_cabang,m_div,m_subdiv,m_dept,m_unit,dept}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'update-unit-bisnis',type:'UPDATE',param:JSON.stringify({id,m_cabang,m_div,m_subdiv,m_dept,m_unit,dept}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {id,m_cabang,m_div,m_subdiv,m_dept,m_unit};
  }catch(error){
      console.log({error})
  }
}

async function deleteUnitBisnis(id,token) {
  let query = `
    delete from 	msticket_unit_bisnis
    where 	id = '${id}'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
         await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'delete-unit-bisnis',type:'DELETE',param:JSON.stringify({id}),apps:'CMK-HELPDESK',status:'berhasil'},token)
      }else{
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'delete-unit-bisnis',type:'DELETE',param:JSON.stringify({id}),apps:'CMK-HELPDESK',status:'gagal'},token)
      }
      return  {id};
  }catch(error){
      console.log({error})
  }
}

async function selectUnitBisnis( 
  search
  ) {
      let query = `SELECT   id as value,m_unit as label FROM msticket_unit_bisnis
      `
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      let dats = data?.recordsets[0]
     
      return  {
        data:dats
        // query
      };
  }catch(error){
      console.log({error})
  }
}

async function getListTiketingSubCategories( 
  page,limit
  ) {
    let last = limit*page
    let first = last - (limit-1) 
  let query = `
  select*from( 
    select
    `
    if(page!==''&&limit!==''){
      query = query+`ROW_NUMBER() OVER 
          (ORDER BY a.id asc) as row
        ,a.*,b.name as category 
        `
    }else{
      query = query+`id as value, name as label
    
    `
    }
    query = query+`
        from msticket_subcategories  a
        join msticket_categories b on b.id = a.id_category
    `
   
    query = query+`  
    ) awek
    `
    if(page!==''&&limit!==''){
    query = query+ `
    where row BETWEEN '${first}' AND '${last}'
  ` 
}
  let query1 = `
  select count(*) as tot from(
    select ROW_NUMBER() OVER 
    (ORDER BY a.id asc) as row
    ,a.*,b.name as category  from msticket_subcategories  a
  join msticket_categories b on b.id = a.id_category
    `
    
    query1 = query1+`  
    ) awek`
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query1);
      
      return  {
        data:data?.recordsets[0],
        // query1,query
        tot:tot.recordsets[0][0]['tot']
        // query,page,limit,search1,search2,type
      };
  }catch(error){
      console.log({error})
  }
}

async function insertSubTiketingCategories(name,color,id_category,token
  ) {
  let query = `
  insert into msticket_subcategories (name,color,id_category,created_at,updated_at)
  values ('${name}', '${color}', '${id_category}','${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
  '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}')
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-tiketing-subcategories',type:'INSERT',param:JSON.stringify({name,color,id_category}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-tiketing-subcategories',type:'INSERT',param:JSON.stringify({name,color,id_category}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {name,color,id_category};
  }catch(error){
      console.log({error})
  }
}

async function updateSubTiketingCategories(id,name,color,id_category,token) {
  let query = `
    update 	msticket_subcategories 
		set  name = '${name}', 
    color = '${color}',
    id_category = '${id_category}',
    updated_at = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
    where 	id = '${id}'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'update-tiketing-subcategories',type:'UPDATE',param:JSON.stringify({id,name,color,id_category}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'update-tiketing-subcategories',type:'UPDATE',param:JSON.stringify({id,name,color,id_category}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {id,name,color};
  }catch(error){
      console.log({error})
  }
}

async function deleteSubCategoriesTiketing(id,token) {
  let query = `
    delete from 	msticket_subcategories
    where 	id = '${id}'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
         await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'delete-tiketing-subcategories',type:'DELETE',param:JSON.stringify({id}),apps:'CMK-HELPDESK',status:'berhasil'},token)
      }else{
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'delete-tiketing-subcategories',type:'DELETE',param:JSON.stringify({id}),apps:'CMK-HELPDESK',status:'gagal'},token)
      }
      return  {id};
  }catch(error){
      console.log({error})
  }
}

async function selectSubCategories( 
  search,category
  ) {
      let query = `SELECT top 5 id as value,name as label FROM msticket_subcategories
      where   name LIKE '%${search}%' `
      if(category!==''){
        query += ` and id_category = '${category}'`
      }
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      let dats = data?.recordsets[0]
     
      return  {
        data:dats
        // query
      };
  }catch(error){
      console.log({error})
  }
}
async function getListMessage( 
  user,search,page,limit,app,type,keyword
  ) {
    let last = limit*page
    let first = last - (limit-1) 
    
  let query0 = `select COUNT(*) as tot from msMessageAllApps a
  left join msticket b on b.id = a.keyOfWord
  where a.to_user = '${user?.nik}' and a.status_read='0' and b.agent_id = '${user?.nik}' 
  and a.type = 'chat'`
  let query01 = `select COUNT(*) as tot from msMessageAllApps a
  left join msticket b on b.id = a.keyOfWord
  where a.to_user = '${user?.nik}' and a.status_read='0' and b.user_id = '${user?.nik}' 
  and a.type = 'chat'`
  let query = `
  select
   
  *from(
    select 
    `
        if(page===''&&limit!==''){
          query += `TOP ${limit}`
        }
        query +=  ` 
    ROW_NUMBER() OVER 
          (ORDER BY id desc) as row
        ,*
        
        from msMessageAllApps
        where  to_user = '${user?.nik}'  
        and app = '${app}'
        and type = '${type}'
    `
    if(page===''&&limit!==''){
      query += `and status_read = '0'`
    }
   if(search!==''){
    query= query+` and title like '%${search}%' or body like '%${search}%'`
   }
   if(keyword!==''){
    query= query+` and keyOfWord= '${keyword}'`
   }
    query = query+`  
    ) awek
    `
    if(page!==''&&limit!==''){
    query = query+`     
    where row BETWEEN '${first}' AND '${last}'
  ` }
  let query1 = `
  select count(*) as tot from(
    select 
    `
        // if(page===''&&limit!==''){
        //   query1 += `TOP ${limit}`
        // }
        query1 +=  `
    ROW_NUMBER() OVER 
          (ORDER BY id desc) as row
        , *  from msMessageAllApps
        where  to_user = '${user?.nik}'  
        and app = '${app}'
        and type = '${type}'
    `
    if(page===''&&limit!==''){
      query1 += `and status_read = '0'`
    }
    if(search!==''){
      query1= query1+` and title like '%${search}%' or body like '%${search}%'`
     }
     if(keyword!==''){
      query1= query1+` and keyOfWord= '${keyword}'`
     }
    query1 = query1+`  
    ) awek`
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query1);
      // let totAgent = await pool.request().query(query0);
      // let totUser = await pool.request().query(query01);
      
      return  {
        data:data?.recordsets[0],
        // query1,
        // query,
        // totAgent:totAgent.recordsets[0][0]['tot'],
        // totUser:totUser.recordsets[0][0]['tot'],
        tot:tot.recordsets[0][0]['tot']
        // query,page,limit,search1,search2,type
      };
  }catch(error){
      console.log({error})
  }
}

async function getListChat( 
  user,search,page,limit,app,type,keyword
  ) {
    let last = limit*page
    let first = last - (limit-1) 
  let query = `
  select * from (
    select ROW_NUMBER() OVER     
		(ORDER BY id asc) as row  ,
		id,title, CAST(body AS  NVARCHAR(4000)) as body, CAST(doc AS  NVARCHAR(4000)) as doc ,app,status_read,type,created_at,created_by,to_user,updated_at,keyOfWord   
		from(    
		select *  from (select *  from 
			(select *  from msMessageAllApps  where  to_user like '%${user?.nik}%'    
			and app = 'CMK-HELPDESK'  and type = 'chat') a  UNION ALL
			select *  from (      
			select *  from msMessageAllApps  where  created_by = '${user?.nik}'    
			and app = 'CMK-HELPDESK'  and type = 'chat') b  ) c where   
			keyOfWord = '${keyword}'          
  
    `
  //   select*from(
  //     select ROW_NUMBER() OVER 
  //     (ORDER BY id asc) as row
  //   ,*  from (
  // select *  from (
  // select *  from msMessageAllApps
  //   where  to_user like '%${user?.nik}%'  
  //   and app = 'CMK-HELPDESK'
  //   and type = 'chat'
  // ) a
  //   UNION ALL
  // select *  from (      
  // select *  from msMessageAllApps
  //   where  created_by = '${user?.nik}'  
  //   and app = 'CMK-HELPDESK'
  //   and type = 'chat'
  // ) b  
  // ) c
  // where   keyOfWord = '${keyword}'
   if(search!==''){
    query= query+` and title like '%${search}%' or body like '%${search}%'`
   }
   
    query = query+`  
    ) awek 
			group by id,title, CAST(body AS  NVARCHAR(4000)), CAST(doc AS  NVARCHAR(4000)) ,app,status_read,type,created_at,created_by,to_user,updated_at,keyOfWord   
			) awek2
    `
    if(page!==''||limit!==''){
    query = query+`     
    where row BETWEEN '${first}' AND '${last}'
  ` }
  let query1 = `
  select count(*) as tot from (
    select ROW_NUMBER() OVER     
		(ORDER BY id asc) as row  ,
		id,title, CAST(body AS  NVARCHAR(4000)) as body, CAST(doc AS  NVARCHAR(4000)) as doc ,app,status_read,type,created_at,created_by,to_user,updated_at,keyOfWord   
		from(    
		select *  from (select *  from 
			(select *  from msMessageAllApps  where  to_user like '%${user?.nik}%'    
			and app = 'CMK-HELPDESK'  and type = 'chat') a  UNION ALL
			select *  from (      
			select *  from msMessageAllApps  where  created_by = '${user?.nik}'    
			and app = 'CMK-HELPDESK'  and type = 'chat') b  ) c where   
			keyOfWord = '${keyword}'
    `
    if(search!==''){
      query1= query1+` and title like '%${search}%' or body like '%${search}%'`
     }
    
    query1 = query1+`  
    ) awek 
    group by id,title, CAST(body AS  NVARCHAR(4000)), CAST(doc AS  NVARCHAR(4000)) ,app,status_read,type,created_at,created_by,to_user,updated_at,keyOfWord   
    ) awek2
    `
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query1);
      
      return  {
        data:data?.recordsets[0],
        // query1,
        // query,
        tot:tot.recordsets[0][0]['tot']
        // query,page,limit,search1,search2,type
      };
  }catch(error){
      console.log({error})
  }
}
async function insertMessageOrChat(
  user,title,body,app,doc,type,to,keyword,token
  ) {
  let query = `
  insert into msMessageAllApps (
    created_by,
    title,
    body,
    app,
    doc,
    type,
    to_user,
    keyOfWord, 
    status_read,
    created_at,
    updated_at
   
    
    )
  values (
    '${user}', 
    '${title}',
    '${body}', 
    '${app}',
    '${doc}', 
    '${type}',
    '${to}', 
    '${keyword}',
    '0',
    '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
    '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
    )
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-chat-message',type:'INSERT',param:JSON.stringify({  user,title,body,app,doc,type,to,keyword,token}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-chat-message',type:'INSERT',param:JSON.stringify({  user,title,body,app,doc,type,to,keyword,token}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
     
      return  {  user,title,body,app,doc,type,to,keyword};
  }catch(error){
      console.log({error})
  }
}
async function readMessageOrChat(
  user,keyword,type,token
  ) {
  let query = `
  update msMessageAllApps set 
    status_read = '1',
    updated_at = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
    `
  if(type!=='chat'){
    query += ` where id=${keyword}`
  }else{
    query +=`
    where to_user like '%${user?.nik}%' and keyOfWord = '${keyword}' and type = '${type}'
    
    ` 
  }
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'read-chat-message',type:'INSERT',param:JSON.stringify({ user,keyword}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'read-chat-message',type:'INSERT',param:JSON.stringify({ user,keyword}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
     
      return  {  user,keyword,query};
  }catch(error){
      console.log({error})
  }
}
async function selectSubPIC( 
  search
  ) {
      let query = `select top 5 (a.m_nik+'-SUB PIC') as value,b.m_nama as label from msticket_pic a
      join dbhrd.dbo.mskaryawan b on a.m_nik = b.m_nik
      where a.m_type ='SUB PIC' and UPPER(b.m_nama) like '%${search?.toUpperCase()}%' `
       
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      let dats = data?.recordsets[0]
     
      return  {
        data:dats
        // query
      };
  }catch(error){
      console.log({error})
  }
}
async function getListTiketing( 
  user,isAgent,priority,category,search,page,limit,status
  ) {
    let last = limit*page
    let first = last - (limit-1) 
  let query = `
  select*from(
    select ROW_NUMBER() OVER 
    (ORDER BY a.id asc) as row
      ,a.*,b.m_nama as user_req, 
      e.name as status,e.color as color_status 
    ,f.num,g.m_nik as pic
    ,c.m_nama as pic_nama 
    ,i.m_nama as toko,
    CASE 
      WHEN j.tot > 0 THEN j.tot
      ELSE 0
    END  as progress,
    l.m_subdivisi as unit
    from msticket a
    join dbhrd.dbo.mskaryawan b on a.user_id = b.m_nik
    
    
    join msticket_status e on a.status_id = e.id
    left join (select COUNT(*) as num,keyOfWord from msMessageAllApps
    where status_read = '0'
    and type='chat'
    and to_user = '${user?.nik}'
    group by keyOfWord) f on a.id = f.keyOfWord
    left join  msticket_pic g on (g.unit_bisnis = a.unit_bisnis	and g.m_type = 'PIC')  
	  left join dbhrd.dbo.mskaryawan c on g.m_nik = c.m_nik    
    left join dbcmk.dbo.msstore_new h on (h.m_kode COLLATE DATABASE_DEFAULT= a.m_toko COLLATE DATABASE_DEFAULT)
	  left join dbcmk.dbo.msmaster i on  (h.m_mall = i.m_kode and i.m_type='MALL')
    left join ( 
          select 
          CAST(CAST(CASE 
            WHEN COUNT(id) > 0 THEN COUNT(id)
            ELSE 0
            END as FLOAT)/CAST(tot as FLOAT) as FLOAT) as tot,id_ticket
          from (
          select 
            a.*,b.tot
          from msticket_task  a 
          left join (select COUNT(*) as tot,id_ticket 
                from msticket_task  
                group by id_ticket) b on a.id_ticket = b.id_ticket
          where  a.id_status = 9 
          ) awek group by id_ticket,tot
      ) j on a.id = j.id_ticket
      join msticket_unit_bisnis k on a.unit_bisnis = k.id
	    left join dbhrd.dbo.mssubdivisi l on l.m_idsubdiv = k.m_unit
    where  (a.subject like '%${search}%' or a.content like '%${search}%')
    `
   if(isAgent==='0'){
    query= query+` and a.user_id = '${user?.nik}'`
   }else{
    query= query+` and (a.agent_id like '%${user?.nik}%' or g.m_nik = '${user?.nik}')`
   }
   if(priority!==''){
    query= query+` and a.priority_id = '${priority}'`
   }
   if(category!==''){
    query= query+` and a.category_id = '${category}'`
   }
   if(status!==''){
    query= query+` and a.status_id = '${status}'`
   }
    query = query+`  
    ) awek
    
    where row BETWEEN '${first}' AND '${last}'
  ` 
  let query1 = `
  select count(*) as tot from(
    select ROW_NUMBER() OVER 
    (ORDER BY a.id asc) as row
      ,a.*,b.m_nama as user_req, 
       e.name as status,e.color as color_status 
    ,f.num,g.m_nik as pic
    ,c.m_nama as pic_nama  
    ,i.m_nama as toko,
    CASE 
      WHEN j.tot > 0 THEN j.tot
      ELSE 0
    END  as progress,
    l.m_subdivisi as unit
    from msticket a
    join dbhrd.dbo.mskaryawan b on a.user_id = b.m_nik
    
    
    join msticket_status e on a.status_id = e.id
    left join (select COUNT(*) as num,keyOfWord from msMessageAllApps
    where status_read = '0'
    and type='chat'
    and to_user = '${user?.nik}'
    group by keyOfWord) f on a.id = f.keyOfWord
    left join  msticket_pic g on (g.unit_bisnis = a.unit_bisnis	and g.m_type = 'PIC')  
	  left join dbhrd.dbo.mskaryawan c on g.m_nik = c.m_nik    
    left join dbcmk.dbo.msstore_new h on (h.m_kode COLLATE DATABASE_DEFAULT= a.m_toko COLLATE DATABASE_DEFAULT)
	  left join dbcmk.dbo.msmaster i on  (h.m_mall = i.m_kode and i.m_type='MALL')
    left join ( 
        select 
        CAST(CAST(CASE 
          WHEN COUNT(id) > 0 THEN COUNT(id)
          ELSE 0
          END as FLOAT)/CAST(tot as FLOAT) as FLOAT) as tot,id_ticket
        from (
        select 
          a.*,b.tot
        from msticket_task  a 
        left join (select COUNT(*) as tot,id_ticket 
              from msticket_task  
              group by id_ticket) b on a.id_ticket = b.id_ticket
        where  a.id_status = 9 
        ) awek group by id_ticket,tot
    ) j on a.id = j.id_ticket
    join msticket_unit_bisnis k on a.unit_bisnis = k.id
	  join dbhrd.dbo.mssubdivisi l on l.m_idsubdiv = k.m_unit
    where (a.subject like '%${search}%' or a.content like '%${search}%')
    `
    if(isAgent==='0'){
      query1= query1+` and a.user_id = '${user?.nik}'`
     }else{
      query1= query1+` and (a.agent_id like '%${user?.nik}%' or  g.m_nik = '${user?.nik}')`
     }
     if(priority!==''){
      query1= query1+` and a.priority_id = '${priority}'`
     }
     if(category!==''){
      query1= query1+` and a.category_id = '${category}'`
     }
     if(status!==''){
      query1= query1+` and a.status_id = '${status}'`
     }
    query1 = query1+`  
    ) awek`
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query1);
      
      return  {
        data:data?.recordsets[0],
        // query1,
        // ,
        query,
        // status,
        tot:tot.recordsets[0][0]['tot']
        // query,page,limit,search1,search2,type
      };
  }catch(error){
      console.log({error})
  }
}
async function insertTiketing(
   user, 
   subject,
   content,
   unit,
   lokasi,
   kota,
   toko, 
   token
  ) {
  // let query = 
  try{
      let pool = await sql.connect(configTICKET);
      let dat2 = await pool.request().query(`
      select * from msticket_pic where unit_bisnis = '${unit}' and m_type = 'PIC'
      `);
      
      dats3=dat2?.recordsets[0][0]
      let login = await pool.request().query(`
      insert into msticket (
        user_id, 
        
        subject,
        content,   
        status_id,
        created_at,
        updated_at,
        completed_at,
        unit_bisnis,
        m_lokasi,
        m_kota,
        m_toko
        )
      values (
        '${user?.nik}', 
        
        '${subject}', 
        '${content}',   
        '1',
        '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
        '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
        '',
        '${unit}',
        '${lokasi}',
        '${kota}',
        '${toko}'
        )
      ` );
      let dat = await pool.request().query(`
      select max(id) as id from msticket 
      `);
      id=dat?.recordsets[0][0]['id']
     
      insertMessageOrChat(
        user?.nik,
        'REQUEST TASK-'+id+' created by : '+user?.nik+'-'+user?.nama,
        content,
        'CMK-HELPDESK',
        '',
        'message',
        dats3?.m_nik,
        id,
        token
        )
        insertMessageOrChat(
          dats3?.m_nik,
          'REQUEST TASK-'+id+' created by : '+user?.nik+'-'+user?.nama,
          content,
          'CMK-HELPDESK',
          '',
          'message',
          user?.nik,
          id,
          token
          )
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-tiketing',type:'INSERT',param:JSON.stringify({user:user?.nik, subject,content,unit,lokasi,kota,toko }),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-tiketing',type:'INSERT',param:JSON.stringify({user:user?.nik, subject,content,unit,lokasi,kota,toko}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {user:user?.nik, subject,content,unit,lokasi,kota,toko,id,dats3,pic:dats3?.m_nik
      };
  }catch(error){
      console.log({error})
  }
}
async function updateTiketing(
  user,id,status,subject,content,doc_file,priority,category,agent,score,m_lokasi,m_kota,m_toko,token
  ) {
    let query2 = ''
    let query3 =''
  let query = `
  update  msticket set 
  `
  if(subject!==''){
  query = query + ` subject='${subject}',`
  }
  if(content!==''){
    query = query + ` content='${content}',`
   }
   if(doc_file!==''){
    query = query + `  doc_file='${doc_file}',`
   }
   if(priority!==''){
    query = query + ` priority_id='${priority}',`
   }
   if(category!==''){
    query = query + ` category_id='${category}',`
   }
   if(agent!==''){
    query = query + ` agent_id='${agent}',`
   }
   if(score!==''){
    query = query + ` score='${score}',`
   }
   if(m_lokasi!==''){
    query = query + ` m_lokasi='${m_lokasi}',`
   }
   if(m_kota!==''){
    query = query + ` m_kota='${m_kota}',`
   }
   if(m_toko!==''){
    query = query + ` m_toko='${m_toko}',`
   }
   
   if(status!==''){
    query = query + `  status_id='${status}',
    completed_at='${status?.toString()==="5"||status?.toString()==="5"?moment(new Date()).format('YYYY-MM-DD HH:mm:ss'):''}',
    `
    
  if(status?.toString()==="6"||status?.toString()==="5"){
     query2 = `delete from msMessageAllApps where keyOfWord = '${id}'`
   }
    query3 = `select * from msticket_status where id='${status}'`
   }

   query = query + ` 
  updated_at='${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'
  
  where id= '${id}'
  ` 
  

  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      
      if(status===4||status===5){
        await pool.request().query(query2);
      }
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'update-tiketing',type:'UPDATE',param:JSON.stringify({id,agent,status,completed_at:status===4||status===5?moment(new Date()).format('YYYY-MM-DD HH:mm:ss'):'',subject,content,doc_file,priority,category}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'update-tiketing',type:'UPDATE',param:JSON.stringify({id,agent,status,completed_at:status===4||status===5?moment(new Date()).format('YYYY-MM-DD HH:mm:ss'):'',subject,content,doc_file,priority,category}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
     let dat = await pool.request().query(`
      select *,b.m_nik as pic from msticket a 
      join msticket_pic b on b.unit_bisnis = a.unit_bisnis
      where a.id = '${id}'
      `);
      let dats
      let arr
      if(status!==''){
        dats = await pool.request().query(query3);
        d=dat?.recordsets[0][0]
        arr = d?.agent_id?JSON.parse(d?.agent_id):[]
        arr?.push({value:d?.pic,label:d?.pic})
        arr?.map((v)=>{
            if(!v?.value?.includes('vendor')){
            
                insertMessageOrChat(
                  user?.nik,
                  dats?.recordsets[0][0]['name']+' TASK-'+id,
                  d?.content,
                  'CMK-HELPDESK',
                  '',
                  'message',
                  user?.nik===v?.value?.toString()?user?.nik:v?.value?.split('-')[1]==='SUB PIC'?v?.value?.split('-')[0]:v?.value,
                  id,
                  token
                  )
              
              }
          })
          insertMessageOrChat(
            user?.nik,
            dats?.recordsets[0][0]['name']+' TASK-'+id,
            d?.content,
            'CMK-HELPDESK',
            '',
            'message',
            d?.user_id,
            id,
            token
            )
      }
      return  {query2,id,agent,status,completed_at:status===4||status===5?moment(new Date()).format('YYYY-MM-DD HH:mm:ss'):'',subject,content,doc_file,priority,category};
  }catch(error){
      console.log({error})
  }
}
async function dashboardTicketing( 
  user
  ) { 
  
 
  try{
      let pool = await sql.connect(configTICKET);
      let data0
      let data1
      let data2
      let data3
      let data4
      let data5
      let arr2 =[]
      let isPIC = []
      let getPIC =[]
      let getGM =[]
      let isGM = []
      let arrGM =[]
      let getDR =[]
      let isDR = []
      let arrDR =[]
      let arrPic =[]
      let arrSubPic =[]
      let arrKroco =[]
      if(user?.m_kode_pangkat== 'DR'){
          data1 = await pool.request().query(`
              select a.*,c.m_foto 
              from
              dbhrd.dbo.mskaryawan a
              join dbhrd.dbo.msdetilkaryawan c on a.m_nik = c.m_nik
              where a.m_kode_pangkat = 'DR'
              and a.m_tglkeluar = '1900-01-01 00:00:00.000'
              and a.m_nik != '000003'
              and a.m_nik='${user?.nik}'
              and a.m_cabang = '1'
              
          `);
          
          
          isDR = data1?.recordsets[0]
          if(isDR?.length>0){
            data2 = await pool.request().query(`
              select * from dbhrd.dbo.mskaryawan where 
              m_departemen = '${isDR[0]['m_departemen']}' 
              and m_tglkeluar = '1900-01-01 00:00:00.000'
              and m_kode_pangkat = 'GM'
            `)
            getGM = data2?.recordsets[0]
            for(const gm of getGM){
              data4 = await pool.request().query(`
                  select a.*,b.m_subdivisi as subdiv,c.m_foto
                  from dbhrd.dbo.mskaryawan a 
                  join dbhrd.dbo.mssubdivisinew b on a.m_subdivisinew = b.m_idsubdiv
                  join dbhrd.dbo.msdetilkaryawan c on a.m_nik = c.m_nik
                  where a.m_kode_pangkat = 'GM'
                  and a.m_tglkeluar = '1900-01-01 00:00:00.000'
                  and a.m_nik='${gm?.m_nik}'
                  and a.m_cabang = '1'
                  
              `);
              isGM = data4?.recordsets[0]
              if(isGM?.length>0){
                getPIC =  await pool.request().query( `
                select a.*,d.m_foto from msticket_pic a
                join dbhrd.dbo.mskaryawan b on a.m_nik = b.m_nik
                join dbhrd.dbo.mssubdivisinew c on c.m_idsubdiv = b.m_subdivisinew
                join dbhrd.dbo.msdetilkaryawan d on b.m_nik = d.m_nik
                where c.m_idsubdiv = '${isGM[0]?.m_subdivisinew}' and m_type = 'PIC'
                `)
                for(const usr of getPIC?.recordsets[0]){
                  data0 = await pool.request().query(`
                      select 
                        case when 
                          count(c.m_nik)>0 then count(c.m_nik)
                        else 
                          0
                        end
                        as tot,
                        d.m_nama as nama, 
                        c.m_nik as nik, SUM(a.score) as score,
                        e.m_divisi+' - '+f.m_subdivisi as loc,
                        d.m_subdivisinew,
                        d.m_departemen,
                        g.m_foto
                      from msticket a
                       join msticket_unit_bisnis b on a.unit_bisnis = b.id
                       join msticket_pic c on c.unit_bisnis = b.id
                       join dbhrd.dbo.mskaryawan d on d.m_nik = c.m_nik
                      join dbhrd.dbo.msdivisi e on b.m_dept = e.m_iddivisi
                      join dbhrd.dbo.mssubdivisi f on b.m_unit = f.m_idsubdiv
                      join dbhrd.dbo.msdetilkaryawan g on d.m_nik = g.m_nik
                      where c.m_type = 'PIC' and score >0 and c.m_nik = '${usr?.m_nik}'
                      group by c.m_nik, d.m_nama,e.m_divisi+' - '+f.m_subdivisi,
                      d.m_subdivisinew,
                      d.m_departemen,
                      g.m_foto
                      
                  `);
                  isPIC = data0?.recordsets[0]
                    

                  if(isPIC?.length>0){
                    for(const e of isPIC){
                      arrPic?.push({nama:e?.nama,nik:e?.nik,score:e?.score,loc:e?.loc,subdiv:e?.m_subdivisinew,div:e?.m_departemen,m_foto:e?.m_foto})
                      let idGm = arrGM?.findIndex(f=>f?.nik?.toString()===isGM[0]?.m_nik?.toString())
                      if(idGm>-1){
                        arrGM[idGm]['score'] = arrGM[idGm]['score'] +e?.score
                      }else{
                        arrGM?.push({nama:isGM[0]?.m_nama,nik:isGM[0]?.m_nik?.toString(),score:e?.score,loc:isGM[0]?.subdiv,subdiv:isGM[0]?.m_subdivisinew,div:isGM[0]?.m_departemen,m_foto:isGM[0]?.m_foto})
                      }
                      data3 = await pool.request().query(`
                        select 
                          a.*,e.m_divisi+' - '+f.m_subdivisi as loc,
                          d.m_subdivisinew,
                          d.m_departemen,g.m_foto
                        from msticket a
                         join msticket_unit_bisnis b on a.unit_bisnis = b.id
                         join msticket_pic c on c.unit_bisnis = b.id
                         join dbhrd.dbo.mskaryawan d on d.m_nik = c.m_nik
                         join dbhrd.dbo.msdivisi e on b.m_dept = e.m_iddivisi
		                     join dbhrd.dbo.mssubdivisi f on b.m_unit = f.m_idsubdiv
                         join dbhrd.dbo.msdetilkaryawan g on d.m_nik = g.m_nik
                        where c.m_type = 'PIC' and score > 0 and c.m_nik = '${e?.nik}'
                            
                        `);
                        let mapwek = data3?.recordsets[0]
                        for(const wek of mapwek) {
                          if(wek?.agent_id!==''&&wek?.agent_id){
                            let wow = JSON.parse(wek?.agent_id)
                            for(const w of wow) {
                            data5 = await pool.request().query(`
                            select a.*,b.m_foto from 
                            dbhrd.dbo.mskaryawan a
                            join dbhrd.dbo.msdetilkaryawan b on a.m_nik = b.m_nik
                            where a.m_nik = '${w?.value?.split('-')[0]}'
                            `)
                              
                              if(w?.value?.split('-')?.length>1){
                                let idx = arrSubPic?.findIndex(f=>f?.nik?.toString()===w?.value?.split('-')[0]?.toString())
                                if(idx>-1){
                                  arrSubPic[idx]['score'] = arrSubPic[idx]['score'] +wek?.score
                                }else{
                                  arrSubPic?.push({nama:w?.label,nik:w?.value?.split('-')[0]?.toString(),score:wek?.score,loc:wek?.loc,subdiv:wek?.m_subdivisinew,div:wek?.m_departemen,m_foto:data5?.recordsets[0][0]?.m_foto })
                                }
                              }else{
                                  let idx = arrKroco?.findIndex(f=>f?.nik?.toString()===w?.value?.split('-')[0]?.toString())
                                  if(idx>-1){
                                    arrKroco[idx]['score'] = arrKroco[idx]['score']+wek?.score
                                  }else{
                                    arrKroco?.push({nama:w?.label,nik:w?.value?.split('-')[0]?.toString(),score:wek?.score,loc:wek?.loc,subdiv:wek?.m_subdivisinew,div:wek?.m_departemen,m_foto:data5?.recordsets[0][0]?.m_foto })
                                  }
                                
                              }
                            
                            }
                          }
                        
                      }
                        
                    }
                  }
                }
                
              }
            }
          }
          for(const e of arrGM){
            let idDR = arrDR?.findIndex(f=>f?.nik?.toString()===isDR[0]?.m_nik?.toString())
            if(idDR>-1){
              arrDR[idDR]['score'] = arrDR[idDR]['score'] +e?.score
            }else{
              arrDR?.push({nama:isDR[0]?.m_nama,nik:isDR[0]?.m_nik?.toString(),score:e?.score,loc:isDR[0]?.subdiv,subdiv:isDR[0]?.m_subdivisinew,div:isDR[0]?.m_departemen,m_foto:isDR[0]?.m_foto})
            }
          }
    }else if(user?.m_kode_pangkat== 'GM'){
        data1 = await pool.request().query(`
            select a.*,b.m_foto
             from dbhrd.dbo.mskaryawan a
             join dbhrd.dbo.msdetilkaryawan b on a.m_nik = b.m_nik
            where a.m_kode_pangkat = 'GM'
            and a.m_tglkeluar = '1900-01-01 00:00:00.000'
            and a.m_nik='${user?.nik}'
            and a.m_cabang = '1'
            
        `);
        isGM = data1?.recordsets[0]
         
         if(isGM?.length>0){
          // console.log({isGM})
            getPIC =  await pool.request().query( `
            select a.*,d.m_foto from msticket_pic a
            join dbhrd.dbo.mskaryawan b on a.m_nik = b.m_nik
            join dbhrd.dbo.mssubdivisinew c on c.m_idsubdiv = b.m_subdivisinew
            join dbhrd.dbo.msdetilkaryawan d on d.m_nik = b.m_nik
            where c.m_idsubdiv = '${isGM[0]?.m_subdivisinew}' and m_type = 'PIC'
            `)
            for(const usr of getPIC?.recordsets[0]){
              data0 = await pool.request().query(`
                  select 
                    case when 
                      count(c.m_nik)>0 then count(c.m_nik)
                    else 
                      0
                    end
                    as tot,
                    d.m_nama as nama, 
                    c.m_nik as nik, SUM(a.score) as score,e.m_divisi+' - '+f.m_subdivisi as loc,
                    d.m_subdivisinew,
                    d.m_departemen,g.m_foto
                  from msticket a
                  left join msticket_unit_bisnis b on a.unit_bisnis = b.id
                  left join msticket_pic c on c.unit_bisnis = b.id
                  left join dbhrd.dbo.mskaryawan d on d.m_nik = c.m_nik
                  join dbhrd.dbo.msdivisi e on b.m_dept = e.m_iddivisi
                  join dbhrd.dbo.mssubdivisi f on b.m_unit = f.m_idsubdiv
                  join dbhrd.dbo.msdetilkaryawan g on d.m_nik = g.m_nik
                  where c.m_type = 'PIC' and score >0 and c.m_nik = '${usr?.m_nik}'
                  group by c.m_nik, d.m_nama,e.m_divisi+' - '+f.m_subdivisi,
                  d.m_subdivisinew,
                  d.m_departemen,g.m_foto
                  
              `);
              isPIC = data0?.recordsets[0]
              
              
              if(isPIC?.length>0){
                for(const e of isPIC){
                  arrPic?.push({nama:e?.nama,nik:e?.nik,score:e?.score,score:e?.score,loc:e?.loc,subdiv:e?.m_subdivisinew,div:e?.m_departemen,m_foto:e?.m_foto})
                  let idGm = arrGM?.findIndex(f=>f?.nik?.toString()===isGM[0]?.m_nik?.toString())
                  if(idGm>-1){
                    arrGM[idGm]['score'] = arrGM[idGm]['score'] +e?.score
                  }else{
                    arrGM?.push({nama:isGM[0]?.m_nama,nik:isGM[0]?.m_nik?.toString(),score:e?.score,loc:e?.loc,subdiv:isGM[0]?.m_subdivisinew,div:isGM[0]?.m_departemen,m_foto:isGM[0]?.m_foto})
                  }
                  data3 = await pool.request().query(`
                    select 
                    CAST(a.agent_id AS NVARCHAR(4000)) as agent_id,a.score,e.m_divisi+' - '+f.m_subdivisi as loc,
                    d.m_subdivisinew,
                    d.m_departemen,g.m_foto
                    from msticket a
                    left join msticket_unit_bisnis b on a.unit_bisnis = b.id
                    left join msticket_pic c on c.unit_bisnis = b.id
                    left join dbhrd.dbo.mskaryawan d on d.m_nik = c.m_nik
                    join dbhrd.dbo.msdivisi e on b.m_dept = e.m_iddivisi
                    join dbhrd.dbo.mssubdivisi f on b.m_unit = f.m_idsubdiv
                    join dbhrd.dbo.msdetilkaryawan g on d.m_nik = g.m_nik
                    where c.m_type = 'PIC' and score > 0 and c.m_nik = '${e?.nik}'
                    group by CAST(a.agent_id AS NVARCHAR(4000)),a.score,e.m_divisi+' - '+f.m_subdivisi,
                    d.m_subdivisinew,
                    d.m_departemen,g.m_foto
                    `);
                    let mapwek = data3?.recordsets[0]
                    for(const wek of mapwek) {
                      if(wek?.agent_id!==''&&wek?.agent_id){
                        let wow = JSON.parse(wek?.agent_id)
                        for(const w of wow) {
                          data5 = await pool.request().query(`
                          select a.*,b.m_foto from 
                          dbhrd.dbo.mskaryawan a
                          join dbhrd.dbo.msdetilkaryawan b on a.m_nik = b.m_nik
                          where a.m_nik = '${w?.value?.split('-')[0]}'
                          `)
                          
                          if(w?.value?.split('-')?.length>1){
                            let idx = arrSubPic?.findIndex(f=>f?.nik?.toString()===w?.value?.split('-')[0]?.toString())
                            if(idx>-1){
                              arrSubPic[idx]['score'] = arrSubPic[idx]['score'] +wek?.score
                            }else{
                              arrSubPic?.push({nama:w?.label,nik:w?.value?.split('-')[0]?.toString(),score:wek?.score,loc:wek?.loc,subdiv:wek?.m_subdivisinew,div:wek?.m_departemen,m_foto:data5?.recordsets[0][0]?.m_foto})
                            }
                          }else{
                              let idx = arrKroco?.findIndex(f=>f?.nik?.toString()===w?.value?.split('-')[0]?.toString())
                              if(idx>-1){
                                arrKroco[idx]['score'] = arrKroco[idx]['score']+wek?.score
                              }else{
                                arrKroco?.push({nama:w?.label,nik:w?.value?.split('-')[0]?.toString(),score:wek?.score,loc:wek?.loc,subdiv:wek?.m_subdivisinew,div:wek?.m_departemen,m_foto:data5?.recordsets[0][0]?.m_foto})
                              }
                            
                          }
                        
                        }
                      }
                    
                  }
                    
                }
              }
            }
          

            
         }
        
    }else {
        data0 = await pool.request().query(`
            select 
              case when 
                count(c.m_nik)>0 then count(c.m_nik)
              else 
                0
              end
              as tot,
              d.m_nama as nama, 
              c.m_nik as nik, SUM(a.score) as score,e.m_divisi+' - '+f.m_subdivisi as loc,
              d.m_subdivisinew,
              d.m_departemen,g.m_foto
            from msticket a
            left join msticket_unit_bisnis b on a.unit_bisnis = b.id
            left join msticket_pic c on c.unit_bisnis = b.id
            left join dbhrd.dbo.mskaryawan d on d.m_nik = c.m_nik
            join dbhrd.dbo.msdivisi e on b.m_dept = e.m_iddivisi
            join dbhrd.dbo.mssubdivisi f on b.m_unit = f.m_idsubdiv
            join dbhrd.dbo.msdetilkaryawan g on d.m_nik = g.m_nik
            where c.m_type = 'PIC' and score >0 and c.m_nik = '${user?.nik}'
            group by c.m_nik, d.m_nama,e.m_divisi+' - '+f.m_subdivisi,
            d.m_subdivisinew,
            d.m_departemen,g.m_foto
            
        `);
      isPIC = data0?.recordsets[0]
      
      if(isPIC?.length>0){
        for(const e of isPIC){
         
        
          arrPic?.push({nama:e?.nama,nik:e?.nik,score:e?.score,loc:e?.loc,subdiv:e?.m_subdivisinew,div:e?.m_departemen,m_foto:e?.m_foto})
          data3 = await pool.request().query(`
            select 
            CAST(a.agent_id AS NVARCHAR(4000)) as agent_id,a.score,e.m_divisi+' - '+f.m_subdivisi as loc,
            d.m_subdivisinew,
            d.m_departemen,g.m_foto
            from msticket a
            join msticket_unit_bisnis b on a.unit_bisnis = b.id
            join msticket_pic c on c.unit_bisnis = b.id
            join dbhrd.dbo.mskaryawan d on d.m_nik = c.m_nik
            join dbhrd.dbo.msdivisi e on b.m_dept = e.m_iddivisi
            join dbhrd.dbo.mssubdivisi f on b.m_unit = f.m_idsubdiv
            join dbhrd.dbo.msdetilkaryawan g on d.m_nik = g.m_nik
            where c.m_type = 'PIC' and score > 0 and c.m_nik = '${e?.nik}'
            group by CAST(a.agent_id AS NVARCHAR(4000)),a.score,e.m_divisi+' - '+f.m_subdivisi,
            d.m_subdivisinew,
            d.m_departemen,g.m_foto
            `);
            let mapwek = data3?.recordsets[0]
           
            for(const wek of mapwek) {
                if(wek?.agent_id!==''&&wek?.agent_id){
                  let wow = JSON.parse(wek?.agent_id)
                  for(const w of wow) {
                    data5 = await pool.request().query(`
                    select a.*,b.m_foto from 
                    dbhrd.dbo.mskaryawan a
                    join dbhrd.dbo.msdetilkaryawan b on a.m_nik = b.m_nik
                    where a.m_nik = '${w?.value?.split('-')[0]}'
                    `)
                    
                    
                    if(w?.value?.split('-')?.length>1){
                      let idx = arrSubPic?.findIndex(f=>f?.nik?.toString()===w?.value?.split('-')[0]?.toString())
                      if(idx>-1){
                        arrSubPic[idx]['score'] = arrSubPic[idx]['score'] +wek?.score
                      }else{
                        arrSubPic?.push({nama:w?.label,nik:w?.value?.split('-')[0]?.toString(),score:wek?.score,loc:wek?.loc,subdiv:wek?.m_subdivisinew,div:wek?.m_departemen,m_foto:data5?.recordsets[0][0]?.m_foto})
                      }
                    }else{
                        let idx = arrKroco?.findIndex(f=>f?.nik?.toString()===w?.value?.split('-')[0]?.toString())
                        if(idx>-1){
                          arrKroco[idx]['score'] = arrKroco[idx]['score']+wek?.score
                        }else{
                          arrKroco?.push({nama:w?.label,nik:w?.value?.split('-')[0]?.toString(),score:wek?.score,loc:wek?.loc,subdiv:wek?.m_subdivisinew,div:wek?.m_departemen,m_foto:data5?.recordsets[0][0]?.m_foto})
                        }
                      
                    }
                  
                  }
                }
              
            }
              
        
        }
        
      }else{
        data2 =await pool.request().query(`select 
        CAST(a.agent_id AS NVARCHAR(4000)) as agent_id,a.score ,e.m_divisi+' - '+f.m_subdivisi as loc,
          d.m_subdivisinew,
          d.m_departemen
          from msticket a
          join msticket_unit_bisnis b on a.unit_bisnis = b.id
          join msticket_pic c on c.unit_bisnis = b.id
          join dbhrd.dbo.mskaryawan d on d.m_nik = c.m_nik
          join dbhrd.dbo.msdivisi e on b.m_dept = e.m_iddivisi
          join dbhrd.dbo.mssubdivisi f on b.m_unit = f.m_idsubdiv
        where a.agent_id like '%${user?.nik}%' 
        and a.score > 0
        group by CAST(a.agent_id AS NVARCHAR(4000)),a.score,e.m_divisi+' - '+f.m_subdivisi,
        d.m_subdivisinew,
        d.m_departemen
        `)
       let arr = data2?.recordsets[0]
      
      //  arr?.map((v,i)=>{
        for(const v of arr) {
          if(v?.agent_id!==''||v?.agent_id){
            arr2 = JSON.parse(v?.agent_id)
            // arr2?.map((w)=>{
              for(const w of arr2) {
              data5 = await pool.request().query(`
              select a.*,b.m_foto from 
              dbhrd.dbo.mskaryawan a
              join dbhrd.dbo.msdetilkaryawan b on a.m_nik = b.m_nik
              where a.m_nik = '${w?.value?.split('-')[0]}'
              `)
                if(w?.value?.includes(user?.nik)){
                  if(w?.value?.split('-')?.length>1){
                      let idx = arrSubPic?.findIndex(f=>f?.nik?.toString()===user?.nik?.toString())
                      if(idx>-1){
                        arrSubPic[idx]['score'] = arrSubPic[idx]['score']+v?.score
                      }else{
                        arrSubPic?.push({nama:w?.label,nik:user?.nik?.toString(),score:v?.score,loc:v?.loc,subdiv:v?.m_subdivisinew,div:v?.m_departemen,m_foto:data5?.recordsets[0][0]?.m_foto})
                      }
                      // arrSubPic?.push({nik:user?.nik?.toString(),score:v?.score})
                      // console.log({arrSubPic})
                  }else{
                      let idx = arrKroco?.findIndex(f=>f?.nik?.toString()===user?.nik?.toString())
                      if(idx>-1){
                        arrKroco[idx]['score'] = arrKroco[idx]['score']+v?.score
                      }else{
                        arrKroco?.push({nama:w?.label,nik:user?.nik?.toString(),score:v?.score,loc:v?.loc,subdiv:v?.m_subdivisinew,div:v?.m_departemen,m_foto:data5?.recordsets[0][0]?.m_foto})
                      }
                    
                  }
                }else{
                  if(w?.value?.split('-')?.length>1){
                    let idx = arrSubPic?.findIndex(f=>f?.nik?.toString()===w?.value?.split('-')[0]?.toString())
                    if(idx>-1){
                      arrSubPic[idx]['score'] = arrSubPic[idx]['score'] +v?.score
                    }else{
                      arrSubPic?.push({nama:w?.label,nik:w?.value?.split('-')[0]?.toString(),score:v?.score,loc:v?.loc,subdiv:v?.m_subdivisinew,div:v?.m_departemen,m_foto:data5?.recordsets[0][0]?.m_foto})
                    }
                  }else{
                      let idx = arrKroco?.findIndex(f=>f?.nik?.toString()===w?.value?.split('-')[0]?.toString())
                      if(idx>-1){
                        arrKroco[idx]['score'] = arrKroco[idx]['score']+v?.score
                      }else{
                        arrKroco?.push({nama:w?.label,nik:w?.value?.split('-')[0]?.toString(),score:v?.score,loc:v?.loc,subdiv:v?.m_subdivisinew,div:v?.m_departemen,m_foto:data5?.recordsets[0][0]?.m_foto})
                      }
                    
                  }
                  
                }
              }
            // })
            arr2=[]
          }
          

          }
      //  })
      }
      


    }
      return  {
        data:{arrKroco,arrSubPic,arrPic,arrGM,arrDR}
        
       
      };
  }catch(error){
      console.log({error})
  }
}
async function getListTiketingTask( 
    ticket
  ) {
     
  let query = `
  select d.name as m_status,a.*,b.name as category,b.color as color_category,c.name as subCategory,c.color as color_subcategory,
  d.color as color_status from msticket_task a
    join msticket_categories b on b.id = a.id_category
    join msticket_subcategories c on c.id = a.id_subcategory
    join msticket_status d on a.id_status = d.id
  where a.id_ticket = '${ticket}'
    `
    
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      
      
      return  {
        data:data?.recordsets[0]
        // query1,query
        
        // query,page,limit,search1,search2,type
      };
  }catch(error){
      console.log({error})
  }
}

async function insertTiketingTask(
  id_ticket,
  id_status,
  id_category,
  id_subcategory,
  m_qty,
  m_nomor_fpp,
  m_file_user,
  m_ket_user,
  token
  ) {
  let query = `
  insert into msticket_task (
    id_ticket,
    id_status,
    id_category,
    id_subcategory,
    m_qty,
    m_history,
    m_nomor_fpp,
    m_file_user,
    m_ket_user,
    created_at,
    updated_at)
  values (
    '${id_ticket}', 
    '${id_status}', 
    '${id_category}', 
    '${id_subcategory}', 
    '${m_qty}',
    '${JSON.stringify([{status:id_status,tgl:moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}])}',  
    '${m_nomor_fpp}', 
    '${m_file_user}', 
    '${m_ket_user}', 
    '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}',
    '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}')
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-tiketing-task',type:'INSERT',param:JSON.stringify({
          id_ticket,
          id_status,
          id_category,
          id_subcategory,
          m_qty,
          m_nomor_fpp,
          m_file_user,
          m_ket_user,
        }),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-tiketing-task',type:'INSERT',param:JSON.stringify({
        id_ticket,
        id_status,
        id_category,
        id_subcategory,
        m_qty,
        m_nomor_fpp,
        m_file_user,
        m_ket_user,
       }),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {
        id_ticket,
        id_status,
        id_category,
        id_subcategory,
        m_qty,
        m_nomor_fpp,
        m_file_user,
        m_ket_user
      };
  }catch(error){
      console.log({error})
  }
}

async function updateTiketingTask(id,
  id_ticket,
  id_status,
  id_category,
  id_subcategory,
  m_qty,
  m_nomor_fpp,
  m_file_user,
  m_ket_user,
  m_file_agent,
  m_ket_agent,
  token,user) {
  let query = `
    update 	msticket_task set  
    id_ticket = '${id_ticket}', 
    id_status = '${id_status}',
    id_category = '${id_category}',
    id_subcategory = '${id_subcategory}',
    m_qty = '${m_qty}',
    m_nomor_fpp = '${m_nomor_fpp}',
    m_file_user = '${m_file_user}',
    m_ket_user = '${m_ket_user}',
    m_file_agent = '${m_file_agent}',
    m_ket_agent = '${m_ket_agent}',
    updated_at = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'

    where 	id = '${id}'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      
      let login = await pool.request().query(query);
      let login2 = await pool.request().query(`select count(*) as done from msticket_task where id_ticket = '${id_ticket}' and id_status = 9`);
      let login3 = await pool.request().query(`select count(*) as pending from msticket_task where id_ticket = '${id_ticket}'`);
      let dat
      if(login3?.recordsets[0][0]['pending']===login2?.recordsets[0][0]['done']){
        await pool.request().query(`update msticket set
        status_id = '4'
        where id ='${id_ticket}' `);
        dat = await pool.request().query(`
        select *,b.m_nik as pic from msticket a 
        join msticket_pic b on b.unit_bisnis = a.unit_bisnis
        where a.id = '${id_ticket}'
        `);
        
        let arr = []
        // dats = await pool.request().query(`select * from msticket_status where id='9'`);
        d=dat?.recordsets[0][0]
        arr = d?.agent_id?JSON.parse(d?.agent_id):[]
        arr?.push({value:d?.pic,label:d?.pic})
        arr?.map((v)=>{
            if(!v?.value?.includes('vendor')){
            
                insertMessageOrChat(
                  user?.nik,
                  // dats?.recordsets[0][0]['name']+' TASK-'+id_ticket,
                  'DONE TASK-'+id_ticket,
                  d?.content,
                  'CMK-HELPDESK',
                  '',
                  'message',
                  user?.nik===v?.value?.toString()?user?.nik:v?.value?.split('-')[1]==='SUB PIC'?v?.value?.split('-')[0]:v?.value,
                  id,
                  token
                  )
              
              }
          })
      }
     
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'update-tiketing-pic',type:'UPDATE',param:JSON.stringify({id,
          id_ticket,
          id_status,
          id_category,
          id_subcategory,
          m_qty,
          m_nomor_fpp,
          m_file_user,
          m_ket_user,
          m_file_agent,
          m_ket_agent,}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'update-tiketing-pic',type:'UPDATE',param:JSON.stringify({id,
        id_ticket,
  id_status,
  id_category,
  id_subcategory,
  m_qty,
  m_nomor_fpp,
  m_file_user,
  m_ket_user,
  m_file_agent,
  m_ket_agent,}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {id,id_ticket,
        id_status,
        id_category,
        id_subcategory,
        m_qty,
        m_nomor_fpp,
        m_file_user,
        m_ket_user,
        m_file_agent,
        m_ket_agent,
        kon:login3?.recordsets[0][0]['pending']===login2?.recordsets[0][0]['done'],
        b:login3?.recordsets[0][0]['pending'],
        w:login2?.recordsets[0][0]['done'],
        query};
  }catch(error){
      console.log({error})
  }
}

async function deleteTaskTiketing(id,token) {
  let query = `
    delete from 	msticket_task
    where 	id = '${id}'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
         await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'delete-tiketing-pic',type:'DELETE',param:JSON.stringify({id}),apps:'CMK-HELPDESK',status:'berhasil'},token)
      }else{
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'delete-tiketing-pic',type:'DELETE',param:JSON.stringify({id}),apps:'CMK-HELPDESK',status:'gagal'},token)
      }
      return  {id};
  }catch(error){
      console.log({error})
  }
}

async function getListScore( 
  page,limit
  ) {
    let last = limit*page
    let first = last - (limit-1) 
  let query = `
  select*from( 
    select
    `
    if(page!==''&&limit!==''){
      query = query+`ROW_NUMBER() OVER 
          (ORDER BY a.id asc) as row
        ,a.*
        `
    }else{
      query = query+`id as value, name as label
    
    `
    }
    query = query+`
        from msticket_score  a
        
    `
   
    query = query+`  
    ) awek
    `
    if(page!==''&&limit!==''){
    query = query+ `
    where row BETWEEN '${first}' AND '${last}'
  ` 
}
  let query1 = `
  select count(*) as tot from(
    select ROW_NUMBER() OVER 
    (ORDER BY a.id asc) as row
    ,a.*  from msticket_score  a
  
    `
    
    query1 = query1+`  
    ) awek`
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
      let tot = await pool.request().query(query1);
      
      return  {
        data:data?.recordsets[0],
        // query1,query
        tot:tot.recordsets[0][0]['tot']
        // query,page,limit,search1,search2,type
      };
  }catch(error){
      console.log({error})
  }
}

async function insertListScore(name,score,token
  ) {
  let query = `
  insert into msticket_score (name,score)
  values ('${name}', '${score}')
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-score',type:'INSERT',param:JSON.stringify({name,score}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'insert-score',type:'INSERT',param:JSON.stringify({name,score}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {name,score};
  }catch(error){
      console.log({error})
  }
}

async function updateListScore(id,name,score,token) {
  let query = `
    update 	msticket_score 
		set  name = '${name}', 
    score = '${score}'
  
    where 	id = '${id}'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'update-score',type:'UPDATE',param:JSON.stringify({id,name,score}),apps:'CMK-HELPDESK',status:'berhasil'},token)
     }else{
       await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'update-score',type:'UPDATE',param:JSON.stringify({id,name,score}),apps:'CMK-HELPDESK',status:'gagal'},token)
     }
      return  {id,name,score};
  }catch(error){
      console.log({error})
  }
}

async function deleteListScore(id,token) {
  let query = `
    delete from 	msticket_score
    where 	id = '${id}'
  ` 
  try{
      let pool = await sql.connect(configTICKET);
      let login = await pool.request().query(query);
      if(login?.recordsets){
         await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'delete-score',type:'DELETE',param:JSON.stringify({id}),apps:'CMK-HELPDESK',status:'berhasil'},token)
      }else{
        await axs.NET('POST',axs.BASE_CMK+'/insert-logs-apps',{menu:'delete-score',type:'DELETE',param:JSON.stringify({id}),apps:'CMK-HELPDESK',status:'gagal'},token)
      }
      return  {id};
  }catch(error){
      console.log({error})
  }
}

async function selectScore( 
  search
  ) {
      let query = `SELECT top 5 id as value,name as label FROM msticket_score
      where   name LIKE '%${search}%' `
      
 
  try{
      let pool = await sql.connect(configTICKET);
      let data = await pool.request().query(query);
 
      let dats = data?.recordsets[0]
     
      return  {
        data:dats
        // query
      };
  }catch(error){
      console.log({error})
  }
}


async function createBulkSQGrooming({payload}){  
   
  payload = (payload||[])

  const dataSQ = []
  const sql = new NewMssql()  

  for(const item of payload){
    item["tipe"] = tipeSQRaporGrommingCheckin
    item["name"] = replaceAll(item.name, "'", " ")
    item["nilai"] = replaceAll(item.nilai, ",", ".")
    item["nilai"] = parseFloat(item.nilai)    
    dataSQ.push(querySQRaport.getValueFromColumn({value: item, formatRemove:"m_", columnExclude:["id", "created_at", "deleted_at"]}))    
  }

  const connection = await sql.getConnection()  

  const resData = await connection.query(querySQRaport.getInsertQuery({values:dataSQ, column:["m_tipe", "m_nik", "m_kode_store", "m_name", "m_brand", "m_nilai"]}))

  await sql.closeConnection()

  const res = {
    status: false,
    count: 0
  }

  if(resData.rowsAffected === 0){
    return res
  }

  res.status = true
  res.count = resData.rowsAffected

  return res 

}

async function createBulkSQHardComplaint({payload}){  
   
  payload = (payload||[])

  const dataSQ = []
  const sql = new NewMssql()  

  for(const item of payload){
    item["tipe"] = tipeSQRaportHardComplaint
    item["name"] = replaceAll(item.name, "'", " ")
    item["nilai"] = replaceAll(item.nilai, ",", ".")
    item["nilai"] = parseFloat(item.nilai)    
    dataSQ.push(querySQRaport.getValueFromColumn({value: item, formatRemove:"m_", columnExclude:["id", "created_at", "deleted_at"]}))    
  }

  const connection = await sql.getConnection()  

  const resData = await connection.query(querySQRaport.getInsertQuery({values:dataSQ, column:["m_tipe", "m_nik", "m_kode_store", "m_name", "m_brand", "m_nilai"]}))

  await sql.closeConnection()

  const res = {
    status: false,
    count: 0
  }

  if(resData.rowsAffected === 0){
    return res
  }

  res.status = true
  res.count = resData.rowsAffected

  return res  
}

async function createBulkSQMShopper({payload}){

  payload = (payload||[])  
  
  const listDataKodeStore = []
  const mapPayload = new Map()

  for(const item of payload){
    listDataKodeStore.push(item.kode_store)
    mapPayload.set(item.kode_store, item.nilai)
  }

  const res = {
    status: false,
    error: null,    
    count: 0
  }  

  let resDataSales = []
  try {
    const tmNet = await net({
      tipe:"POST", 
      url:`${axs.BASE_CMK}/store/sales`, 
      data:{
        kode_store: listDataKodeStore,      
      }
    })    
    resDataSales = tmNet.data.data
  } catch (error) {
    res.error = error
    return res
  }    

  const dataSQ = []
  const sql = new NewMssql()  

  for(const item of resDataSales){
    
    const tm = {}

    tm["tipe"] = tipeSQRaportMysteryShopper
    tm["nik"] = item.m_nik
    tm["name"] = replaceAll(item.m_nama, "'", " ")
    tm["kode_store"] = item.m_cabang    
    tm["brand"] = item.m_brand    
    
    if(typeof mapPayload.get(item.m_cabang) === "undefined" ){      
      tm["nilai"] = 0      
    }

    tm["nilai"] = parseFloat(replaceAll(mapPayload.get(item.m_cabang), ",", ".")) 

    dataSQ.push(querySQRaport.getValueFromColumn({value: tm, formatRemove:"m_", columnExclude:["id", "created_at", "deleted_at"]}))    

  }  

  const connection = await sql.getConnection()  

  const resData = await connection.query(querySQRaport.getInsertQuery({values:dataSQ, column:["m_tipe", "m_nik", "m_kode_store", "m_name", "m_brand", "m_nilai"]}))

  await sql.closeConnection()  

  if(resData.rowsAffected === 0){
    res.error = "Tidak ada data yang masuk kedalam DB"
    return res
  }

  res.status = true
  res.count = resData.rowsAffected

  return res  
  
}

function renderTypeOfMap({data}){
  const mapTypeOf = {
    "undefined":0,
    "number":data
  }
  return mapTypeOf[typeof data]
}

async function sortingCalculateSQRaport({period}){
  const data = await getCalculateSQRaport({period})    
  const dataSort = mergeSort({arr:data.data, func:sortingConditionForSQRaport})      
  let dataFilter = []
  let index = 0;
  for(const item of dataSort){    
    if(index >= 5) break
    dataFilter.push(item)
    index++
  }
  return dataFilter
}

async function getCalculateSQRaportDetail({period, kode_store, nik}){

  const keyKodeStore = "KODE_STORE"

  let arrWhere = []
  let arrWhereMShopper = []
  let queryFilterStoreVisitSQ = ""
  const date = new Date(period)

  arrWhereMShopper = [
    "WHERE m_deleted_at IS NULL",      
    `AND CONVERT(VARCHAR,m_kode_store) = ${formatValue({data:kode_store})}`,
    `AND CONVERT(VARCHAR,m_tipe) IN (${formatValue({data:tipeSQRaportMysteryShopper})})`,
    `AND CONVERT(VARCHAR,m_nik) = ${formatValue({data:nik})}`
  ]
  arrWhere = [
    "WHERE m_deleted_at IS NULL",
    `AND MONTH(m_created_at) = ${formatValue({data:(date.getMonth()+1)})}`,
    `AND YEAR(m_created_at) = ${formatValue({data:(date.getFullYear())})}`,
    `AND CONVERT(VARCHAR,m_kode_store) = ${formatValue({data:kode_store})}`,
    `AND CONVERT(VARCHAR, m_nik) = ${formatValue({data:nik})}`,
    `AND CONVERT(VARCHAR,m_tipe) IN (${formatValue({data:tipeSQRaporGrommingCheckin})}, ${formatValue({data:tipeSQRaportHardComplaint})});`
  ]
  queryFilterStoreVisitSQ = `AND store = ${formatValue({data:kode_store})}`

  let query = querySQRaport.getSelectQuery({
    where: arrWhere,
    isPagination: false
  })  

  let queryMShopper = querySQRaport.getSelectQuery({
    column: ["m_kode_store, m_nilai"],
    where: arrWhereMShopper,
    order: "ORDER BY m_created_at DESC",   
    isPagination: false,    
  })       

  const sql = new NewMssql()  
  const connection = await sql.getConnection()

  const resData = await Promise.all([
    connection.query(query.selectQuery), 
    connection.query(queryGetLastSumBobot.replace("@filter_store", queryFilterStoreVisitSQ)),
    connection.query(queryMShopper.selectQuery)
  ])  

  const data = resData[0]  

  const mapVisitSQ = new Map()
  const mapMShopper = new Map()

  for(const itemVSQ of resData[1].recordset){
    if(typeof mapVisitSQ.get(itemVSQ.store) === "number"){      
      continue
    }
    mapVisitSQ.set(itemVSQ.store, itemVSQ.nilai)
  }      

  for(const itemMS of resData[2].recordset){
    if(typeof mapMShopper.get(itemMS.m_kode_store) === "number"){      
      continue
    }
    mapMShopper.set(itemMS.m_kode_store, itemMS.m_nilai)
  }      

  const response = {
    data : [],
    status: false, 
    isEmpty: true
  }

  if(data.recordset.length === 0){        
    return response
  }    
  
  let mapObj = new Map()  
  
  for(const item of data.recordset){            
    let tmpMap = new Map()
    if(typeof mapObj.get(item.m_nik) !== "undefined"){
      tmpMap = mapObj.get(item.m_nik)
    }
    tmpMap.set(item.m_tipe,item.m_nilai)  
    tmpMap.set(keyKodeStore, item.m_kode_store)      
    //nested map
    mapObj.set(item.m_nik, tmpMap)    
  }   

  let responseCalculate = []  

  for(const item of mapObj){    
    
    let ob = {}    

    let tmMap = new Map(item[1]) 
    
    const grooming = renderTypeOfMap({data:tmMap.get(tipeSQRaporGrommingCheckin)})        
    const mshopper = renderTypeOfMap({data:mapMShopper.get(tmMap.get(keyKodeStore))})
    const hcomplaint = renderTypeOfMap({data:tmMap.get(tipeSQRaportHardComplaint)})
    const sqVisit = renderTypeOfMap({data:mapVisitSQ.get(tmMap.get(keyKodeStore))})
    const smVisit = renderTypeOfMap({data:(mapVisitSQ.get(tmMap.get(keyKodeStore)))<=10||typeof (mapVisitSQ.get(tmMap.get(keyKodeStore))) === "undefined" ?0:(mapVisitSQ.get(tmMap.get(keyKodeStore)))-10})

    ob["nik"] = item[0]
    ob["kode_store"] = tmMap.get(keyKodeStore)
    ob["nilai"] = {
      [tipeSQRaporGrommingCheckin]:grooming,
      [tipeSQRaportMysteryShopper]:mshopper,
      [tipeSQRaportHardComplaint]:hcomplaint,
      [tipeSQRaportInternalVisit]:sqVisit,
      [tipeSQRaportSMRoleplay]:smVisit,
      total: ((grooming+mshopper+sqVisit+smVisit)/4)+hcomplaint
    }        
    
    responseCalculate.push(ob)
  }

  response.data = responseCalculate
  response.isEmpty = false  
  response.status = true

  return response

}

async function getCalculateSQRaport({period, kode_store}){

  const keyKodeStore = "KODE_STORE"

  let arrWhere = []
  let arrWhereMShopper = []
  let queryFilterStoreVisitSQ = ""
  const date = new Date(period)

  if(typeof kode_store === "undefined") {    
    arrWhereMShopper = [
      "WHERE m_deleted_at IS NULL",            
      `AND CONVERT(VARCHAR,m_tipe) IN (${formatValue({data:tipeSQRaportMysteryShopper})})`
    ]
    arrWhere = [
      "WHERE m_deleted_at IS NULL",
      `AND MONTH(m_created_at) = ${formatValue({data:(date.getMonth()+1)})}`,
      `AND YEAR(m_created_at) = ${formatValue({data:(date.getFullYear())})}`,      
      `AND CONVERT(VARCHAR,m_tipe) IN (${formatValue({data:tipeSQRaporGrommingCheckin})}, ${formatValue({data:tipeSQRaportHardComplaint})});`
    ]
  }else{
    arrWhereMShopper = [
      "WHERE m_deleted_at IS NULL",      
      `AND CONVERT(VARCHAR,m_kode_store) = ${formatValue({data:kode_store})}`,
      `AND CONVERT(VARCHAR,m_tipe) IN (${formatValue({data:tipeSQRaportMysteryShopper})})`
    ]
    arrWhere = [
      "WHERE m_deleted_at IS NULL",
      `AND MONTH(m_created_at) = ${formatValue({data:(date.getMonth()+1)})}`,
      `AND YEAR(m_created_at) = ${formatValue({data:(date.getFullYear())})}`,
      `AND CONVERT(VARCHAR,m_kode_store) = ${formatValue({data:kode_store})}`,
      `AND CONVERT(VARCHAR,m_tipe) IN (${formatValue({data:tipeSQRaporGrommingCheckin})}, ${formatValue({data:tipeSQRaportHardComplaint})});`
    ]
    queryFilterStoreVisitSQ = `AND store = ${formatValue({data:kode_store})}`
  }  

  let query = querySQRaport.getSelectQuery({
    where: arrWhere,
    isPagination: false
  })  

  let queryMShopper = querySQRaport.getSelectQuery({
    column: ["m_kode_store, m_nilai"],
    where: arrWhereMShopper,
    order: "ORDER BY m_created_at DESC",   
    isPagination: false,    
  })       

  const sql = new NewMssql()  
  const connection = await sql.getConnection()

  const resData = await Promise.all([
    connection.query(query.selectQuery), 
    connection.query(queryGetLastSumBobot.replace("@filter_store", queryFilterStoreVisitSQ)),
    connection.query(queryMShopper.selectQuery)
  ])  

  const data = resData[0]  

  const mapVisitSQ = new Map()
  const mapMShopper = new Map()

  for(const itemVSQ of resData[1].recordset){
    if(typeof mapVisitSQ.get(itemVSQ.store) === "number"){      
      continue
    }
    mapVisitSQ.set(itemVSQ.store, itemVSQ.nilai)
  }      

  for(const itemMS of resData[2].recordset){
    if(typeof mapMShopper.get(itemMS.m_kode_store) === "number"){      
      continue
    }
    mapMShopper.set(itemMS.m_kode_store, itemMS.m_nilai)
  }      

  const response = {
    data : [],
    status: false, 
    isEmpty: true
  }

  if(data.recordset.length === 0){        
    return response
  }    
  
  let mapObj = new Map()  
  
  for(const item of data.recordset){            
    let tmpMap = new Map()
    if(typeof mapObj.get(item.m_nik) !== "undefined"){
      tmpMap = mapObj.get(item.m_nik)
    }
    tmpMap.set(item.m_tipe,item.m_nilai)  
    tmpMap.set(keyKodeStore, item.m_kode_store)      
    //nested map
    mapObj.set(item.m_nik, tmpMap)    
  }   

  let responseCalculate = []  

  for(const item of mapObj){    
    
    let ob = {}    

    let tmMap = new Map(item[1]) 
    
    const grooming = renderTypeOfMap({data:tmMap.get(tipeSQRaporGrommingCheckin)})        
    const mshopper = renderTypeOfMap({data:mapMShopper.get(tmMap.get(keyKodeStore))})
    const hcomplaint = renderTypeOfMap({data:tmMap.get(tipeSQRaportHardComplaint)})
    const sqVisit = renderTypeOfMap({data:mapVisitSQ.get(tmMap.get(keyKodeStore))})
    const smVisit = renderTypeOfMap({data:(mapVisitSQ.get(tmMap.get(keyKodeStore)))<=10||typeof (mapVisitSQ.get(tmMap.get(keyKodeStore))) === "undefined" ?0:(mapVisitSQ.get(tmMap.get(keyKodeStore)))-10})

    ob["nik"] = item[0]
    ob["kode_store"] = tmMap.get(keyKodeStore)
    ob["nilai"] = {
      [tipeSQRaporGrommingCheckin]:grooming,
      [tipeSQRaportMysteryShopper]:mshopper,
      [tipeSQRaportHardComplaint]:hcomplaint,
      [tipeSQRaportInternalVisit]:sqVisit,
      [tipeSQRaportSMRoleplay]:smVisit,
      total: ((grooming+mshopper+sqVisit+smVisit)/4)+hcomplaint
    }        
    
    responseCalculate.push(ob)
  }

  response.data = responseCalculate
  response.isEmpty = false  
  response.status = true

  return response

}

module.exports = { 
  getCalculateSQRaportDetail,
  sortingCalculateSQRaport,
  getCalculateSQRaport,
  createBulkSQMShopper,
  createBulkSQHardComplaint,
  createBulkSQGrooming,
  getListScore,
  insertListScore,
  updateListScore,
  deleteListScore,
  selectScore,
  selectSubPIC,
  getListTiketingTask,
  insertTiketingTask,
  updateTiketingTask,
  deleteTaskTiketing,
  getListTiketingPIC,
  insertTiketingPIC,
  updateTiketingPIC,
  deletePICTiketing,
  getListUnitBisnis,
  insertUnitBisnis,
  updateUnitBisnis,
  deleteUnitBisnis,
  selectUnitBisnis,
  getListTiketingSubCategories,
  insertSubTiketingCategories,
  updateSubTiketingCategories,
  deleteSubCategoriesTiketing,
  selectSubCategories,
  dashboardTicketing,
  readMessageOrChat,
  getListChat,
  getListTiketing,
  insertTiketing,
  updateTiketing,
  insertMessageOrChat,
  getListMessage,
  selectCategories,
  getListTiketingCategories,
  insertTiketingCategories,
  updateTiketingCategories,
  deleteCategoriesTiketing,
  getListCategoriesUser,
  insertCategoriesUser,
  updateCategoriesUser,
  deleteCategoriesUser,
  getListStatusTiketing,
  insertStatusTiketing,
  updateStatusTiketing,
  deleteStatusTiketing,
  changeFpp,
  notificationDetailEntryRequest,
  deleteVisitSq,
  notification,
  deleteFollowUp,
  insertFotoFollowUp,
  insertEntrySetStatusTask,
  insertEntrySetPicHistory,
  insertEntrySetPicDetail,
  sendEmailKompetensiLegalitas,
  getKompetensiSendmail,
  sendEmailReminderBangunanPenunjangLegalitas,
  countBangunanPenunjang,
  getKategoriLegalitas,
  updateKompetensiLegalitas,
  updateBangunanPenunjangLegalitas,
  updateKategoriLegalitas,
  insertKompetensiLegalitas,
  insertBangunanPenunjangLegalitas,
  insertKategoriLegalitas,
  listKompetensiLegalitas,
  listBangunanPenunjangLegalitas,
  listKategoriLegalitas,
  insertBudget,
  listBudget,
  sendEmailApprovedSQVisit,
  sendEmailApprovedSQCall,
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