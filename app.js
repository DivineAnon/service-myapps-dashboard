require('dotenv').config()
var dashboard = require('./dashboard');
var upload = require('./upload');
var  express = require('express');
var  bodyParser = require('body-parser');
var  cors = require('cors');
var  app = express();
var  router = express.Router();
const multer = require('multer');
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


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
      },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
var upload = multer({ storage: storage });
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
router.route('/test-upload').post( upload.single('image'),(req, res) => {
   
  const image =  req.file;
  let data = req.body?.data
  console.log( data );
  console.log( req.file );
  res.json({status:'Succsess',message:'Succsess fetch data',image,data});
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
router.route('/follow-up').post((request, response) => {
  let token = request.headers.authorization 
  let st = request.body?.st
  let start = request.body?.start
  let end = request.body?.end
  let lokasi = request.body?.lokasi
  let city = request.body?.city
  let unit = request.body?.unit
  let search =  request.body?.search
  let limit = request.body?.limit
  let page = request.body?.page
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.getFollow( st,start,end,lokasi,city,unit,search,limit,page).then((data) => {
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
router.route('/finish-follow-up').post((request, response) => {
  let token = request.headers.authorization 
  let m_number = request.body?.m_number
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.getSelesaiFollowUp( m_number).then((data) => {
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
router.route('/get-unit-filter').post((request, response) => {
  let token = request.headers.authorization 
 
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.getListUnit().then((data) => {
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
router.route('/get-kategori-filter').post((request, response) => {
  let token = request.headers.authorization 
  let unit = request.body?.unit
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.getKategoriSupport(unit).then((data) => {
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
router.route('/get-subkategori-filter').post((request, response) => {
  let token = request.headers.authorization 
  let kategori = request.body?.kategori
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.getSubKategoriSupport(kategori).then((data) => {
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
router.route('/entry-request').post((request, response) => {
  let token = request.headers.authorization 
  let st = request.body?.st
  let start = request.body?.start
  let end = request.body?.end
  let div = request.body?.div
  let dep = request.body?.dep
  let sub = request.body?.sub
  let unit = request.body?.unit
  let limit = request.body?.limit
  let page = request.body?.page
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.getDataEntry(decoded?.data[0],start,end,dep,div,sub,st,unit,limit,page ).then((data) => {
      response.json({status:'Succsess',message:'Succsess fetch data',data,decoded:decoded?.data[0]});
    })
  } catch(err) {
    if(err?.name==='TokenExpiredError'){
      
      response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
    }else{
      
      response.status(500).json({ error: 'Server Error',message:'Invalid token' });
      
    }

  }
})
router.route('/export-follow-up').post((request, response) => {
  let token = request.headers.authorization 
  let start = request.body?.start
  let end = request.body?.end
  let unit = request.body?.unit
  let dep = request.body?.dep
  let m_nomor = request.body?.m_nomor
  let store = request.body?.store
  let area = request.body?.area

  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.getExportFollowUp(start,end,unit,dep,m_nomor,store,area).then((data) => {
      response.json({status:'Succsess',message:'Succsess fetch data',data });
    })
  } catch(err) {
    if(err?.name==='TokenExpiredError'){
      
      response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
    }else{
      
      response.status(500).json({ error: 'Server Error',message:'Invalid token' });
      
    }

  }
})
router.route('/export-follow-up-pic').post((request, response) => {
  let token = request.headers.authorization 
  let start = request.body?.start
  let end = request.body?.end
  let unit = request.body?.unit
  let dep = request.body?.dep
  let m_nomor = request.body?.m_nomor
  let store = request.body?.store
  let area = request.body?.area
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.getExportFollowUpPIC(start,end,unit,dep,m_nomor,store,area).then((data) => {
      response.json({status:'Succsess',message:'Succsess fetch data',data });
    })
  } catch(err) {
    if(err?.name==='TokenExpiredError'){
      
      response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
    }else{
      
      response.status(500).json({ error: 'Server Error',message:'Invalid token' });
      
    }

  }
})
var  port = process.env.PORT || 8090;
app.listen(port);
console.log('Order API is runnning at ' + port);