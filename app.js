var  Db = require('./dboperations');
var dashboard = require('./dashboard');
var  express = require('express');
var  bodyParser = require('body-parser');
var  cors = require('cors');
var  app = express();
var  router = express.Router();
const swaggerUi = require('swagger-ui-express'),
swaggerDocument = require('./swagger.json');

app.use(bodyParser.urlencoded({ extended:  true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/api', router);
app.use(
  '/api-docs',
  swaggerUi.serve, 
  swaggerUi.setup(swaggerDocument)
);

router.route('/hello-goodbye').get((request, response) => {
  dashboard.getDataHelloGoodBye().then((data) => {
    response.json(data[0]);
  })
})

// router.route('/absensi/:userlogin').get((request, response) => {
//   dashboard.getDataAbsensi(request.params.userlogin).then((data) => {
//     response.json(data[0]);
//   })
// })

// router.route('/hbd/:userlogin').get((request, response) => {
//   dashboard.getDataHBD(request.params.userlogin).then((data) => {
//     response.json(data[0]);
//   })
// })

router.route('/openstore').get((request, response) => {
  dashboard.getDataStoreOpen().then((data) => {
    response.json(data[0]);
  })
})

var  port = process.env.PORT || 8090;
app.listen(port);
console.log('Order API is runnning at ' + port);