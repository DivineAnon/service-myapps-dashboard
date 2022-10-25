 
const  axios = require('axios');
//local

 const PATH_DOC = 'http://localhost:8888'
 const BASE_DOC = 'http://localhost:8888/api'
 const BASE_MASTER = "http://localhost:9016/api"
 const BASE_BUDGET = "http://localhost:9015/api"
 const BASE_INFO = "http://localhost:9014/api"
 const BASE_HRD = "http://localhost:9013/api"
 const BASE_CMK = "http://localhost:9011/api"
 const BASE_TICKET = "http://localhost:9010/api" //dashboard
 const PATH_TICKET = "http://localhost:9010" //dashboard
 const BASE_LOGIN = "http://localhost:8096/api" //login
 const BASE_FRANK = "http://localhost:9050/api" //dashboard
 const BASE_MONDIAL = "http://localhost:9051/api" //dashboard
 const BASE_PALACE = "http://localhost:9052/api"//login
 
//production
// export const BASE_LOGIN = 'http://103.247.217.10:8091/api';
// const BASE_INFO = "https://api-dbinfo.cmk.co.id/api" 
// const BASE_HRD = "https://api-dbhrd.cmk.co.id/api"
// const BASE_CMK = "https://api-dbcmk.cmk.co.id/api"
// const BASE_TICKET = "https://api-dbticket.cmk.co.id/api"
// const PATH_TICKET = "https://api-dbticket.cmk.co.id" //dashboard
// const BASE_LOGIN = "https://api-dbportal.cmk.co.id/api" //login
// const BASE_BUDGET = "https://api-dbbudget.cmk.co.id/api"
// const PATH_DOC = 'https://api-documents.cmk.co.id'

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
  BASE_MASTER,
 BASE_FRANK,
 BASE_MONDIAL,
 BASE_PALACE,
  BASE_DOC,
  NET,
  PATH_DOC,
  BASE_INFO,
  BASE_HRD,
  BASE_BUDGET,
  BASE_CMK,
  BASE_TICKET,
  PATH_TICKET,
  BASE_LOGIN
}
