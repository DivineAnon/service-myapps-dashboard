require('dotenv').config()
var dashboard = require('./dashboard'); 
const fs = require('fs')
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
app.use(express.static('public')); //baris untuk get iamge
app.use('/uploads', express.static('uploads')); //baris untuk get image
 
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
        cb(null, './uploads/entry-request');
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
router.route('/taks-history').post((request, response) => {
  let token = request.headers.authorization 
  let m_number = request.body?.id
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.insertEntryRequesHistory( m_number).then((data) => {
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
router.route('/taks-approve').post((request, response) => {
  let token = request.headers.authorization 
  let id = request.body?.id
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.approveTicketing(decoded?.data[0]?.loginid,id).then((data) => {
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
router.route('/detail-follow-up/:id').post((request, response) => {
  let token = request.headers.authorization 
  let id = request.params.id
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.detailFollowUp(id).then((data) => {
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
router.route('/progress-ticketing/:no').get((request, response) => {
  let token = request.headers.authorization 
  let no = request.params.no
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.getHistoryTiket(no).then((data) => {
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
router.route('/generate-entry-request').post((request, response) => {
  let token = request.headers.authorization 
 
  let unit = request.body?.unit
 
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.getGenerateEntryRequest(unit).then((data) => {
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
router.route('/detail-entry-request').post((request, response) => {
  let token = request.headers.authorization 
 
  let no = request.body?.no
 
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.detailEntryRequest(no).then((data) => {
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

router.route('/test-upload').post( upload.single('image'),(req, res) => {
   
  const image =  req.file;
  let data = req.body?.data
  console.log( data );
  console.log( req.file );
   
  fs.rename('./uploads/entry-request/'+image?.filename, './uploads/entry-request/'+'a.jpg', function(err) {
    if ( err ) console.log('ERROR: ' + err);
  })
  res.json({status:'Succsess',message:'Succsess fetch data',image,data,img:image?.filename});
})
router.route('/delete-upload').post((req, res) => {
  let name = './uploads/entry-request/'+req?.body?.name
  try {
    fs.unlinkSync(name)
    res.json({status:'Succsess',message:'Succsess fetch data',name  });
  } catch(err) {
    res.json({status:'Error',message:'Succsess fetch data',err,name  });
    
  }
  
})
router.route('/insert-entry-request').post((request, response) => {
  let token = request.headers.authorization 
  let no = request.body?.no
  let unit = request.body?.unit
  let div = request.body?.div
  let dep = request.body?.dep
  let store = request.body?.store
  let city = request.body?.city
  let lokasi = request.body?.lokasi
  
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
 
    dashboard.insertEntryRequest(decoded?.data[0]?.loginid,no,unit,
      div,dep,store,city,lokasi).then((data) => {
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

router.route('/insert-entry-request-list').post(upload.single('image'),(request, response) => {
  let token = request.headers.authorization 
  let no = request.body?.no
  let id = request.body?.id
  let kategori = request.body?.kategori
  let subkategori = request.body?.subkategori
  let ket = request.body?.ket
  let m_nomor = request.body?.m_nomor
  let foto_name = `${m_nomor}_${no}.jpg`
  let qty = request.body?.qty
  let fpp = request.body?.fpp
  const image =  request.file;
 
  fs.rename('./uploads/entry-request/'+image?.filename, `./uploads/entry-request/${foto_name}`, function(err) {
    if ( err ) console.log('ERROR: ' + err);
  })
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
   
    dashboard.insertEntryRequestList(id,
      kategori,subkategori,ket,foto_name,no,m_nomor,
      qty,fpp).then((data) => {
      response.json({status:'Succsess',message:'Succsess fetch data',data  });
    })
  } catch(err) {
    if(err?.name==='TokenExpiredError'){
      
      response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
    }else{
      
      response.status(500).json({ error: 'Server Error',message:'Invalid token' });
      
    }

  }
})
router.route('/update-entry-request').post((request, response) => {
  let token = request.headers.authorization 
 
  let unit = request.body?.unit
  let no = request.body?.no
  let m_kode = request.body?.m_kode
  let m_kode2 = request.body?.m_kode2
  let m_kota = request.body?.m_kota
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.updateEntryRequest(no,unit,m_kode,m_kode2,m_kota).then((data) => {
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
router.route('/update-entry-request-list').post(upload.single('image'),(request, response) => {
  let token = request.headers.authorization 
  let name = './uploads/entry-request/'+request?.body?.name
  let m_nomor = request.body?.m_nomor
  let no = request.body?.no
  let r = (Math.random() + 1).toString(36).substring(7);
  let foto_name = `${m_nomor}_${no}_${r}.jpg`
  let id = request.body?.id
  let kategori = request.body?.kategori
  let subkategori = request.body?.subkategori
  let ket = request.body?.ket
  let qty = request.body?.qty
  let fpp = request.body?.fpp
  const image =  request.file;
 
  let a = false
  
  if(request.file){
    
    a = true
    
    fs.unlinkSync(name)
    fs.rename('./uploads/entry-request/'+image?.filename, `./uploads/entry-request/${foto_name}`, function(err) {
      if ( err ) console.log('ERROR: ' + err);
    })
  }else{
    a= false
  }
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.updateEntryRequestList(id,
      kategori,
      subkategori,
      ket,
      foto_name,
      qty,
      fpp,
      a
      ).then((data) => {
      response.json({status:'Succsess',message:'Succsess fetch data',data,image, a });
    })
  } catch(err) {
    if(err?.name==='TokenExpiredError'){
      
      response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
    }else{
      
      response.status(500).json({ error: 'Server Error',message:'Invalid token' });
      
    }

  }
})
router.route('/delete-entry-request-list').post((req, res) => {
  let name = './uploads/entry-request/'+req?.body?.name
  let id = req?.body?.id
  try {
    fs.unlinkSync(name)
    dashboard.deleteEntryRequestList(id).then((data) => {
      res.json({status:'Succsess',message:'Succsess fetch data',data });
    })
    
  } catch(err) {
    res.json({status:'Error',message:'Succsess fetch data',err,name  });
    
  }
  
})
router.route('/check-entry-request-list').post((req, res) => {
   
  let id = req?.body?.id
  try {
   
    dashboard.checkEntryRequestList(id).then((data) => {
      res.json({status:'Succsess',message:'Succsess fetch data',data });
    })
    
  } catch(err) {
    res.json({status:'Error',message:'Succsess fetch data',err,name  });
    
  }
  
})
router.route('/generate-entry-request-list').post((req, res) => {
   
  let id = req?.body?.id
  try {
   
    dashboard.getGenerateEntryRequestList(id).then((data) => {
      res.json({status:'Succsess',message:'Succsess fetch data',data });
    })
    
  } catch(err) {
    res.json({status:'Error',message:'Succsess fetch data',err,name  });
    
  }
  
})
var  port = process.env.PORT || 8090;
app.listen(port);
console.log('Order API is runnning at ' + port);