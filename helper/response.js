const response = (res, {  
  code,
  message,  
  data,
  metadata,
}) => {

  code = (code||200)
  message = (message||"")
  data = (data||null)
  metadata = (metadata||null)

  const ob = {
    code,
    message,    
    data,
    metadata
  }

  res.status(code).json(ob)

}

const responseValidator = (req, res, next, error, value) => {  
  if(error != null){
    const ob = {
      message : "",
      data : {}
    }    
    ob.message = "Something wrong with you request"
    ob.data = error?.details[0]?.message
    res.status(400).json(ob)
    return
  }
  else{        
    req.validated = value
    next()
  }
}

const resAttachToFile = (res, {data, nameFile, typeFile}) => {
  
  data = (data||"")
  nameFile = (nameFile||"")
  typeFile = (typeFile||"")

  if(!res){
    return "res object from express is needed"
  }
  res.attachment(nameFile)
  res.type(typeFile)
  res.send(data)
}

module.exports = {
  response,
  responseValidator,
  resAttachToFile
}