require('dotenv').config()
var dashboard = require('./dashboard'); 
const fs = require('fs')
var  express = require('express');
var  bodyParser = require('body-parser');
var  cors = require('cors');
var  moment = require('moment');
var  app = express();
var  router = express.Router();
const multer = require('multer');
const swaggerUi = require('swagger-ui-express'),
swaggerDocument = require('./swagger.json');
const { check,validationResult ,oneOf } = require('express-validator');
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
const storageVisitSq = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './uploads/visit-sq');
    },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
  }
});
var upload = multer({ storage: storage });
var uploadVisitSq  = multer({ storage: storageVisitSq  });
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
router.route('/get-list-question-sq').post((request, response) => {
  let token = request.headers.authorization 
  let limit = request.body?.limit
  let page = request.body?.page
  let search1 = request.body?.search1
  let search2 = request.body?.search2
  let type = request.body?.type
 
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.listAddQuestionsSq( page,limit,search1,search2,type).then((data) => {
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
router.route('/add-question-sq').post((request, response) => {
  let token = request.headers.authorization 
 
  let id_type = request.body?.id_type
  let pernyataan = request.body?.pernyataan
  let feedback = request.body?.feedback
  let bobot = request.body?.bobot
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.AddQuestionSq(id_type,pernyataan,feedback,bobot).then((data) => {
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
router.route('/update-question-sq').post((request, response) => {
  let token = request.headers.authorization 
   
  let id = request.body?.id
  let id_type = request.body?.id_type
  let pernyataan = request.body?.pernyataan
  let feedback = request.body?.feedback
  let bobot = request.body?.bobot
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.updateQuestionSq(id,id_type,pernyataan,feedback,bobot).then((data) => {
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
router.route('/togel-kuesioner-sq').post((request, response) => {
  let token = request.headers.authorization 
  let id = request.body?.id
  let st = request.body?.st
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.togelQuestionSq(id,st).then((data) => {
      response.json({status:'Succsess',message:'Succsess change status',data});
    })
  } catch(err) {
    if(err?.name==='TokenExpiredError'){
      
      response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
    }else{
      
      response.status(500).json({ error: 'Server Error',message:'Invalid token' });
      
    }

  }
})
router.route('/delete-question-sq').post((request, response) => {
  let token = request.headers.authorization 
  let id = request.body?.id
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.deleteQuestionSq(id).then((data) => {
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
router.route('/get-list-type-sq').post((request, response) => {
  let token = request.headers.authorization 
  let limit = request.body?.limit
  let page = request.body?.page
  let search = request.body?.search
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.listAddTypeQuestionSq(page,limit,search).then((data) => {
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
router.route('/add-type-sq').post(
  
  check('nama').exists().withMessage('nama is not null'),
  check('nama').custom((value, { req,res })=>{
    return   dashboard.checkTypeSq(req?.body?.nama).then((data) => {
      if(data?.data>0){
        return Promise.reject('Nama already exist'); 
      }
     
    })
  }) ,
  (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array()  });
    }
  let token = request.headers.authorization 
  let nama = request.body?.nama
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.addTypeQuestionSq(nama.toLowerCase()).then((data) => {
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

router.route('/update-type-sq').post(
  check('nama').exists().withMessage('nama is not null'),
  check('nama').custom((value, { req,res })=>{
    return   dashboard.checkTypeSq(req?.body?.nama).then((data) => {
      if(data?.data>0){
        return Promise.reject('Nama already exist'); 
      }
     
    })
  }) ,
  
  (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array()  });
    }
  let token = request.headers.authorization 
  let nama = request.body?.nama
  let id = request.body?.id
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.updateTypeQuestionSq(id,nama.toLowerCase()).then((data) => {
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
router.route('/delete-type-sq').post((request, response) => {
  let token = request.headers.authorization 
  let id = request.body?.id
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.deleteTypeQuestionSq(id).then((data) => {
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
router.route('/togel-type-sq').post((request, response) => {
  let token = request.headers.authorization 
  let id = request.body?.id
  let st = request.body?.st
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.togelTypeQuestionSq(id,st).then((data) => {
      response.json({status:'Succsess',message:'Succsess change status',data});
    })
  } catch(err) {
    if(err?.name==='TokenExpiredError'){
      
      response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
    }else{
      
      response.status(500).json({ error: 'Server Error',message:'Invalid token' });
      
    }

  }
})
router.route('/select-type-sq').post((request, response) => {
  let token = request.headers.authorization 
  let nama = request.body?.nama
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.listSelectTypeQuestionSq(nama).then((data) => {
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
router.route('/get-list-kategori-sq').post((request, response) => {
  let token = request.headers.authorization 
  let limit = request.body?.limit
  let page = request.body?.page
  let search = request.body?.search
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.listAddKategoriQuestionSq(page,limit,search).then((data) => {
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
router.route('/add-kategori-sq').post(
  
  // check('nama').exists().withMessage('nama is not null'),
  // check('nama').custom((value, { req,res })=>{
  //   return   dashboard.checkKategoriSq(req?.body?.nama).then((data) => {
  //     if(data?.data>0){
  //       return Promise.reject('Nama already exist'); 
  //     }
     
  //   })
  // }) ,
  (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array()  });
    }
  let token = request.headers.authorization 
  let nama = request.body?.nama
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.addKategoriQuestionSq(nama.toLowerCase()).then((data) => {
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

router.route('/update-kategori-sq').post(
  check('nama').exists().withMessage('nama is not null'),
  check('nama').custom((value, { req,res })=>{
    return   dashboard.checkKategoriSq(req?.body?.nama).then((data) => {
      if(data?.data>0){
        return Promise.reject('Nama already exist'); 
      }
     
    })
  }) ,
  
  (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array()  });
    }
  let token = request.headers.authorization 
  let nama = request.body?.nama
  let id = request.body?.id
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.updateKategoriQuestionSq(id,nama.toLowerCase()).then((data) => {
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
router.route('/delete-kategori-sq').post((request, response) => {
  let token = request.headers.authorization 
  let id = request.body?.id
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.deleteKategoriQuestionSq(id).then((data) => {
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
router.route('/togel-kategori-sq').post((request, response) => {
  let token = request.headers.authorization 
  let id = request.body?.id
  let st = request.body?.st
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.togelKategoriQuestionSq(id,st).then((data) => {
      response.json({status:'Succsess',message:'Succsess change status',data});
    })
  } catch(err) {
    if(err?.name==='TokenExpiredError'){
      
      response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
    }else{
      
      response.status(500).json({ error: 'Server Error',message:'Invalid token' });
      
    }

  }
})
router.route('/select-kategori-sq').post((request, response) => {
  let token = request.headers.authorization 
  let nama = request.body?.nama
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.listSelectKategoriQuestionSq(nama).then((data) => {
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

router.route('/set-pic').post((request, response) => {
  let token = request.headers.authorization 
  let id = request.body?.id
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.setPIC(id).then((data) => {
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
router.route('/set-pic-detail').post((request, response) => {
  let token = request.headers.authorization 
  let id = request.body?.id
  let m_pic = request.body?.m_pic
  let shift = request.body?.shift
  
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.getSelesaiFollowUp(id,m_pic,shift).then((data) => {
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
router.route('/get-list-pic').get((request, response) => {
  let token = request.headers.authorization 
   
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.searchPicName().then((data) => {
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
router.route('/check-stock-pic').post((request, response) => {
  let token = request.headers.authorization 
  let st = request.body?.st
  let id = request.body?.id 
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.checkStockTaskPIC(id,st).then((data) => {
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
router.route('/insert-scoring').post((request, response) => {
  let token = request.headers.authorization 
  let kode = request.body?.kode
  let nomor = request.body?.nomor
  let m_rating = request.body?.m_rating
  let review = request.body?.review
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.insertScoring(decoded?.data[0]?.loginid,kode,nomor,m_rating,review).then((data) => {
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
router.route('/add-visit').post((request, response) => {
  let token = request.headers.authorization 
  
  let store = request.body?.store
  let tim_sq = request.body?.tim_sq
  let jr = request.body?.jr
  
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.addVisitSq(
      decoded?.data[0]?.loginid,
      store,
      tim_sq,
      jr
    ).then((data) => {
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
router.route('/get-kuesioner/:visit').get((request, response) => {
  let token = request.headers.authorization 
  let visit = request.params?.visit
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.setKuesioner(
     visit
    ).then((data) => {
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
router.route('/insert-update-jawaban').post((request, response) => {
  let token = request.headers.authorization 
  
  let id_kuesioner = request.body?.id_kuesioner
  let id_visit = request.body?.id_visit
  let id = request.body?.id
  let jawaban = request.body?.jawaban
  let type = request.body?.type
  let bobot = request.body?.bobot
  
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.jawabanKuesioner(
      id,
      jawaban,
      type,
      bobot,
      id_kuesioner,
      id_visit).then((data) => {
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
router.route('/get-note-to-pusat/:visit').get((request, response) => {
  let token = request.headers.authorization 
  let visit = request.params?.visit
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.getDataNoteToPusat(
     visit
    ).then((data) => {
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
router.route('/insert-note-to-pusat').post((request, response) => {
  let token = request.headers.authorization 
  
   
  let id_visit = request.body?.id_visit
  let ket = request.body?.ket
  let tggp = request.body?.tggp
 
  
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.insertDataNoteToPusat(
      id_visit,
      ket,
      tggp 
      ).then((data) => {
      response.json({status:'Succsess',message:'Succsess add data',data});
    })
  } catch(err) {
    if(err?.name==='TokenExpiredError'){
      
      response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
    }else{
      
      response.status(500).json({ error: 'Server Error',message:'Invalid token' });
      
    }

  }
})
router.route('/update-note-to-pusat').post((request, response) => {
  let token = request.headers.authorization 
  
   
  let id = request.body?.id
  let ket = request.body?.ket
  let tggp = request.body?.tggp
 
  
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.updateDataNoteToPusat(
      id,
      ket,
      tggp 
      ).then((data) => {
      response.json({status:'Succsess',message:'Succsess update data',data});
    })
  } catch(err) {
    if(err?.name==='TokenExpiredError'){
      
      response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
    }else{
      
      response.status(500).json({ error: 'Server Error',message:'Invalid token' });
      
    }

  }
})
router.route('/delete-note-to-pusat').post((request, response) => {
  let token = request.headers.authorization 
  
   
  let id = request.body?.id
 
  
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.deleteDataNoteToPusat
    (
      id
      ).then((data) => {
      response.json({status:'Succsess',message:'Succsess delete data',data});
    })
  } catch(err) {
    if(err?.name==='TokenExpiredError'){
      
      response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
    }else{
      
      response.status(500).json({ error: 'Server Error',message:'Invalid token' });
      
    }

  }
})
router.route('/get-visit-detail/:id').get((request, response) => {
  let token = request.headers.authorization 
  let id = request.params?.id
  
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.getDataVisitDetail(
      id
    ).then((data) => {
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
router.route('/insert-image-visit-sq').post(uploadVisitSq.single('image'),(request, response) => {
  let token = request.headers.authorization 
  let id = request.body?.id
  let old = request.body?.old
  let insert = ''
  let foto_name = `${moment(new Date()).format('YYYY-MM-DD-HH-mm-ss')}_${id}.jpg`
  const image =  request.file;
  if(old===''){
    insert = foto_name
  }else{
    insert = old+','+foto_name
  }
  
  fs.rename('./uploads/visit-sq/'+image?.filename, `./uploads/visit-sq/${foto_name}`, function(err) {
    if ( err ) console.log('ERROR: ' + err);
  })
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
   
    dashboard.insertImageVisit(
      id,insert
      ).then((data) => {
      response.json({status:'Succsess',message:'Succsess fetch data',data ,insert });
    })
  } catch(err) {
    if(err?.name==='TokenExpiredError'){
      
      response.status(401).json({ error: 'Unauthorized',message:'Your session expired' });
    }else{
      
      response.status(500).json({ error: 'Server Error',message:'Invalid token' });
      
    }

  }
})
router.route('/delete-upload-visit-sq').post((req, res) => {
  // 
  let img = req?.body?.img
  let name = './uploads/visit-sq/'+img
  let id = req?.body?.id
  let old = req?.body?.old
  let data = []
  let isData = null
  let insert = ''
  let coma = ''
  if(old.includes(",")){
    data = old.split(',')
    isData = data.findIndex(v => v == img)
   
    data.splice(isData, 1);
    data.map((d,i)=>{
      coma = i===0?'':','
      insert = insert+coma+d

    })
  } 
   

  
  try {
    fs.unlinkSync(name)
    dashboard.insertImageVisit(
      id,insert
      ).then((data) => {
      res.json({status:'Succsess',message:'Succsess delete image',data ,insert });
    })
   
  } catch(err) {
    res.json({status:'Error',message:'Succsess fetch data',err,name  });
    
  }
  
})
router.route('/get-visit-review').post((request, response) => {
  let token = request.headers.authorization 
  let page = request.body?.page
  let limit = request.body?.limit
  let search = request.body?.search
  let store = request.body?.store
  let status = request.body?.status
  let start = request.body?.start
  let end = request.body?.end
    
  try {
    var decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    dashboard.getReviesVisit(
      page,limit,search,store,status,start,end
    ).then((data) => {
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
var  port = process.env.PORT || 8090;
app.listen(port);
console.log('Order API is runnning at ' + port);