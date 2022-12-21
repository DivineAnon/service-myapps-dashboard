const jwt = require('jsonwebtoken');
const { response } = require('../helper/response');

const midBearerToken = (req, res, next) => {

  const token = req.headers.authorization 

  try {
    jwt.verify(token, process.env.TOKEN_SECRET);
    next();
  } catch (error) {
    if(error?.name === "TokenExpiredError"){
      response(res, {
        code : 401,
        message:"Your session expired",        
      })
      return
    }
    response(res, {
      code : 500,
      message:"Invalid token",        
    })
  }

}

module.exports = {
  midBearerToken
}