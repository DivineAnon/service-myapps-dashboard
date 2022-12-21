const { readFile } = require("fs/promises");

async function renderEmail({
  path,
  mapValue
}){  

  path = (path||"")
  mapValue = (mapValue||new Map())
  
  let fileStr = await readFile(path, {encoding:"utf8"})      

  for(const item of mapValue.keys()){    
    fileStr = fileStr.replace(item, mapValue.get(item))          
  }

  return fileStr
}

module.exports = {renderEmail}