require('dotenv').config()
var dashboard = require('./dashboard');
var  express = require('express');
var  bodyParser = require('body-parser');
var  cors = require('cors');
var  app = express();
var  router = express.Router();
const swaggerUi = require('swagger-ui-express'),
swaggerDocument = require('./swagger.json');
var jwt = require('jsonwebtoken');
app.use(bodyParser.urlencoded({ extended:  true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/api', router);
app.use(
  '/api-docs',
  swaggerUi.serve, 
  swaggerUi.setup(swaggerDocument)
);
router.use((request, response, next) => {
  console.log('middleware');
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Authorization');
  next();
});

router.route('/hello-goodbye').get((request, response) => {
  let token = request.headers.authorization 
   
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
      dashboard.getDataHelloGoodBye().then((data) => {
        response.json({status:'Succsess',message:'Succsess fetch data',data:data[0]});
      })
    // response.json({decoded,token});
  } catch(err) {
   
   
    if(err?.name==='TokenExpiredError'){
       
      response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
    }else{
      
      response.status(500).json({ error: 'Server Error',message:'Invalid token' });
       
    }

  }

})

router.route('/absensi').get((request, response) => {
  let token = request.headers.authorization 
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
  dashboard.getDataAbsensi(decoded?.data[0]?.loginid).then((data) => {
    response.json({status:'Succsess',message:'Succsess fetch data',data});
  })
} catch(err) {
   
   
  if(err?.name==='TokenExpiredError'){
     
    response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
  }else{
    
    response.status(500).json({ error: 'Server Error',message:'Invalid token' });
     
  }

}
})

router.route('/hbd').get((request, response) => {
  let token = request.headers.authorization 
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.getDataHBD().then((data) => {
      response.json({status:'Succsess',message:'Succsess fetch data',data});
    })
  } catch(err) {
    
    response.json({err});
    if(err?.name==='TokenExpiredError'){
      
      response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
    }else{
      
      response.status(500).json({ error: 'Server Error',message:'Invalid token' });
      
    }

  }
})

 
  
  router.route('/openstore').get((request, response) => {
   
    let token = request.headers.authorization 
    try {
      var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
       dashboard.getDataStoreOpen(decoded?.data[0]?.loginid).then((data) => {
          response.json({status:'Succsess',message:'Succsess fetch data',data:data[0]});
          
        })
    } catch(err) {
      
      
      if(err?.name==='TokenExpiredError'){
        
        response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
      }else{
        
        response.status(500).json({ error: 'Server Error',message:'Invalid token' });
        
      }
  
    }
  })
router.route('/todo-list').get((request, response) => {
  let token = request.headers.authorization 
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.getDataToDoList(decoded?.data[0]?.loginid).then((data) => {
      response.json({status:'Succsess',message:'Succsess fetch data',data});
    })
  } catch(err) {
    
    
    if(err?.name==='TokenExpiredError'){
      
      response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
    }else{
      
      response.status(500).json({ error: 'Server Error',message:'Invalid token' });
      
    }

  }
})
router.route('/todo-list-monitoring').get((request, response) => {
  let token = request.headers.authorization 
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.getMonitoring(decoded?.data[0]?.loginid).then((data) => {
      response.json({status:'Succsess',message:'Succsess fetch data',data});
    })
  } catch(err) {
    
    
    if(err?.name==='TokenExpiredError'){
      
      response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
    }else{
      
      response.status(500).json({ error: 'Server Error',message:'Invalid token' });
      
    }

  }
})

router.route('/reportAbsen/:tglFrm/:tglTo').get((request, response) => {
  
 
  let token = request.headers.authorization 
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
 
  dashboard.getDataAbsensiReport(decoded?.data[0]?.loginid,request.params.tglFrm,request.params.tglTo).then((data) => {
        response.json({status:'Succsess',message:'Succsess fetch data',data});
      })
  } catch(err) {
    
    
    if(err?.name==='TokenExpiredError'){
      
      response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
    }else{
      
      response.status(500).json({ error: 'Server Error',message:'Invalid token' });
      
    }

  }
})

router.route('/news/:tglFrm/:tglTo').get((request, response) => {
  dashboard.getNews(request.params.tglFrm,request.params.tglTo).then((data) => {
    response.json({status:'Succsess',message:'Succsess fetch data',data});
  })
  // dashboard.getDataHelloGoodBye().then((data) => {
  //   response.json({status:'Succsess',message:'Succsess fetch data',data:data[0]});
  // })
  // let token = request.headers.authorization 
  // try {
  //   var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
 
  // dashboard.getDataAbsensiReport(decoded?.data[0]?.loginid,request.params.tglFrm,request.params.tglTo).then((data) => {
  //       response.json({status:'Succsess',message:'Succsess fetch data',data});
  //     })
  // } catch(err) {
    
    
  //   if(err?.name==='TokenExpiredError'){
      
  //     response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
  //   }else{
      
  //     response.status(500).json({ error: 'Server Error',message:'Invalid token' });
      
  //   }

  // }
})
var  port = process.env.PORT || 8090;
app.listen(port);
console.log('Order API is runnning at ' + port);