var  moment = require('moment');

const baseQuerySelectPagination = `
  SELECT * FROM (
    SELECT (ROW_NUMBER() OVER (@order)) as row, @column from @table 
    @join
    @where    
  ) subQuery 
  @pagination  
`

const baseQuerySelectCount = `
  SELECT COUNT(*) as total from @table 
  @join  
  @where
  @order
`

const baseQuerySelect = `
  SELECT @column from @table 
  @join 
  @where
  @order
`

const mapBaseQuerySelect = {
  true: baseQuerySelectPagination,
  false: baseQuerySelect
}

const baseQueryUpdate = `
  UPDATE @table SET
  @set
  @where
`

const baseQueryInsert = `
  INSERT INTO @table (@column)
  OUTPUT Inserted.ID
  VALUES 
  @values
`

const baseQueryDelete = `
  DELETE FROM @table
  @where
`

const BaseVariable = {
  where : "@where",
  table : "@table",
  column: "@column",
  join  : "@join",
  order : "@order",
  values: "@values",
  rowOrder: "@rowOrder",
  set: "@set",
  pagination: "@pagination"
}

function generateIteration({
  isFirst,
  iteration
}){
  return isFirst ? " WHERE " : iteration
}

function formatNameColumn({
  column,
  karakter,
  isFormatID
}){
  let resColumn = []
  
  column = (column||[])
  karakter = (karakter||"")  

  if (column.length === 0) {
    return resColumn
  }
  for(let i=0;i<column.length;i++){
    const tmKarakter = karakter

    let formatKarakter = ""

    if(isFormatID && column[i].search("id_") != -1){
      formatKarakter = column[i]
      resColumn.push(formatKarakter)
      continue
    }

    formatKarakter = tmKarakter.replace("@column", column[i])

    resColumn.push(formatKarakter)

  }
  return resColumn
}

function formatValue({
  data
}){    
  if(typeof data === "undefined" || data === null){
    return `NULL`
  }  

  if(typeof data === "string"){
    return `'${data}'`
  }

  if(typeof data.getMonth === "function"){    
    return `'${moment(data).format('YYYY-MM-DD')}'`
  }  
  
  return data
}

//handler for query builder
function QueryBuilder({
  table,
  column
}){

  table = (table||"")
  column = (column||[])
  
  this.columnUniq = []

  for(const item of column){
    this.columnUniq.push(`${item} as ${table}_${item}`)
  }

  this.column = column
  this.table = table  
  this.columnQuery = this.column.join(" , ")
}

QueryBuilder.prototype.getTable = function(){
  return this.table
}

QueryBuilder.prototype.setTable = function(table) {
  table = (table||"")
  this.table = table
}

QueryBuilder.prototype.getColumn = function(){
  return this.column
}

QueryBuilder.prototype.getColumnUniq = function(){
  return this.columnUniq
}

QueryBuilder.prototype.setColumn = function(column) {
  column = (column||[])

  this.columnUniq = []

  for(const item of column){
    this.columnUniq.push(`${item} as ${this.table}_${item}`)
  }
  
  this.column = column  
  this.columnQuery = this.column.join(" , ")  
}

QueryBuilder.prototype.getValueFromColumn = function getValueFromColumn({
  value,
  columnExclude,
  formatAdd,
  formatRemove,
  tipeQuery
}){  
  value = (value||{})
  columnExclude = (columnExclude||[])    
  formatAdd = (formatAdd||"@column")
  formatRemove = (formatRemove||"")
  
  //tipeQuery => insert/update
  tipeQuery = (tipeQuery||"insert")

  const mapColumn = new Map()
  for(let i=0;i<columnExclude.length;i++){
    mapColumn.set(columnExclude[i], true)
  }
  let data = []  
  for(let j=0;j<this.column.length;j++){
    const tmFormatAdd = formatAdd            
    const itemColumn = tmFormatAdd.replace(formatAdd, this.column[j]).replace(formatRemove, "")        
    if(mapColumn.size !== 0 && mapColumn.get(itemColumn)){
      continue;
    }          
    if(tipeQuery==="insert"){
      data.push(formatValue({data:value[itemColumn]}))
      continue;
    }  
    data.push(`${this.column[j]} = ${formatValue({data:value[itemColumn]})}`)
  }  
  return data
}

QueryBuilder.prototype.getSelectQuery = function({
  column,
  join,
  where,
  order,
  pagination,  
  isPagination,
  removeFormatWhereCount
}){

  column = (column||"")
  join = (join||[])
  where = (where||[])
  order = (order||"")
  pagination = (pagination||"")    
  removeFormatWhereCount = (removeFormatWhereCount||`${this.table}_`)

  let whereQueryCount = []

  if(join.length !== 0){
    for(const item of where){
      let tempReplace = item
      whereQueryCount.push(tempReplace.replace(removeFormatWhereCount, ""))    
    }
  }else{
    whereQueryCount = where
  }

  let countQuery = baseQuerySelectCount

  let whereQuery = whereQueryCount.join(" ")  
  const joinQuery = join.join(" ")  

  countQuery = countQuery.replace(BaseVariable.table, this.table)  
  countQuery = countQuery.replace(BaseVariable.join, joinQuery)
  countQuery = countQuery.replace(BaseVariable.where, whereQuery)
  countQuery = countQuery.replace(BaseVariable.order, order)
  
  whereQuery = where.join(" ")

  //where.push(pagination)

  //const whereWithPagination = where.join(" ")
  
  let selectQuery = mapBaseQuerySelect[isPagination]    

  let columnQueryUse = column || this.columnQuery  
  
  selectQuery = selectQuery.replace(BaseVariable.table, this.table)
  selectQuery = selectQuery.replace(BaseVariable.column, columnQueryUse)
  selectQuery = selectQuery.replace(BaseVariable.join, joinQuery)
  selectQuery = selectQuery.replace(BaseVariable.where, whereQuery)
  selectQuery = selectQuery.replace(BaseVariable.pagination, pagination)
  selectQuery = selectQuery.replace(BaseVariable.order, order)

  return {
    selectQuery,
    countQuery
  }

}


QueryBuilder.prototype.getInsertQuery = function({
  values,
  column
}){

  values = (values||[[]])
  column = (column||[])  

  const lengValues = values.length

  let insertQuery = baseQueryInsert
  let valuesQuery = ""

  for(let i=0;i<lengValues;i++){
    const value = values[i].join(" , ")

    let iterator = ","
    //last index
    if((lengValues-1) === i) {
      iterator = ";"
    }
    valuesQuery += `( ${value} )${iterator}`
  }

  const mapColumnQueryFinal = {
    false: column.join(" , "),
    true: this.columnQuery
  }  

  insertQuery = insertQuery.replace(BaseVariable.column, mapColumnQueryFinal[(column?.length === 0)])
  insertQuery = insertQuery.replace(BaseVariable.table, this.table)
  insertQuery = insertQuery.replace(BaseVariable.values, valuesQuery)

  return insertQuery

}

QueryBuilder.prototype.getUpdateQuery = function({
  set,
  where
}){

  set = (set||[])
  where = (where||[])

  const setQuery = set.join(" , ")
  const whereQuery = where.join(" ")

  let updateQuery = baseQueryUpdate

  updateQuery = updateQuery.replace(BaseVariable.table, this.table)
  updateQuery = updateQuery.replace(BaseVariable.set, setQuery)
  updateQuery = updateQuery.replace(BaseVariable.where, whereQuery)  

  return updateQuery

}

QueryBuilder.prototype.getDeleteQuery = function({
  where
}){

  where = (where||[])

  const whereQuery = where.join(" ")

  let deleteQuery = baseQueryDelete

  deleteQuery = deleteQuery.replace(BaseVariable.table, this.table)  
  deleteQuery = deleteQuery.replace(BaseVariable.where, whereQuery)  

  return deleteQuery

}

module.exports = {
  QueryBuilder, 
  formatNameColumn,
  formatValue,
  generateIteration
};