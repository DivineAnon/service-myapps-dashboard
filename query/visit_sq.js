const queryGetLastSumBobot = `
  SELECT
    ROW_NUMBER() OVER (order by tvs.created_at DESC) as row,
    tvs.store,
    SUM(tjv.bobot) as nilai,       
    tvs.created_at  
  FROM t_visit_sq2 tvs
    LEFT JOIN t_history_visit  tjv on tvs.id = tjv.id_visit  
  WHERE [type] = 'VISIT'
    AND status_kuesioner = 'APPROVED'
    @filter_store      
    AND tjv.m_jawaban = 'true'
  GROUP BY tvs.created_at, tvs.store  
`

module.exports = {queryGetLastSumBobot}