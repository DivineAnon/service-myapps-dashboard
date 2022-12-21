const axios = require('axios')

const net = async ({
  tipe,
  url,
  data,  
  responseType,
  headers,
  timeout
}) => {

  tipe = (tipe||"GET")
  url = (url||"")
  data = (data||{})      
  headers = (headers||{
    "Content-Type" : "application/json",    
  })
  responseType = (responseType||"json")
  timeout = (timeout||0)

  let objectResponse = {
    status : true,
    data : {},
    error: null
  }  

  try {
   
    const res = await axios({
      method : tipe,      
      url : (url),      
      data,
      responseType : responseType,
      headers : headers,
      timeout: timeout
    }) 
    objectResponse.status = true
    objectResponse.data = res?.data     
 
  } 
  
  catch (error) {   
 
    if(/401/ig.test(error)){
      logoutEvent();    
    }    

    objectResponse.status = false
    objectResponse.data = error?.response?.data  
    objectResponse.error = error

  }

  return objectResponse

}

module.exports={net}