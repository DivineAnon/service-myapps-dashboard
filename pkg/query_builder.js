const QueryBuilder = require('../helper/query').QueryBuilder;

const querySQRaport = new QueryBuilder({
  table:"t_sq_raport",
  column: [    
	  "id",
    "m_tipe",
	  "m_nik",
    "m_kode_store",
	  "m_name",
	  "m_brand",
	  "m_nilai",
	  "m_created_at",
    "m_deleted_at",	  
  ]
})

module.exports = {
  querySQRaport
}