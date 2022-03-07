 
const  axios = require('axios');
//local

const BASE_INFO = "http://localhost:8093/api"
const BASE_HRD = "http://localhost:8092/api"
const BASE_CMK = "http://localhost:8091/api"
const BASE_TICKET = "http://localhost:8090/api" //dashboard
const BASE_LOGIN = "http://localhost:8089/api" //login
//production
// export const BASE_LOGIN = 'http://103.247.217.10:8091/api';
 

const NET = async (tipe, url, data, token, pin, isMultipart, isStream) => {
 
  tipe = (tipe||"GET")
  url = (url||"")
  data = (data||{})
  token = (token||"")
  pin = (pin||"")
  isMultipart = (isMultipart||false)
  isStream = (isStream||false)

  let objectResponse = {
    status : true,
    data : {}
  }

  try {
   
    const res = await axios({
      method : tipe,      
      url : (url),      
      data,
      responseType : (isStream)?"stream":"json",
      headers : {
        'Content-Type' : (isMultipart)?"multipart/form-data":"application/json",
        // 'Authorization-pin' : pin,
        'Authorization' : token,        
      }      
    }) 
    objectResponse.status = true
    objectResponse.data = res?.data     
 
  } 
  
  catch (error) {   
 
    if(/401/ig.test(error)){
      
    }
    objectResponse.status = false
    objectResponse.data = error?.response?.data    
  }

  return objectResponse

}

module.exports = {
  NET,
  BASE_INFO,
  BASE_HRD,
  BASE_CMK,
  BASE_TICKET,
  BASE_LOGIN
}
