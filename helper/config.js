'use strict'
const express    = require('express');		// call express
const app        = express(); 				// define our app using express
const bodyParser = require('body-parser'); 	// get body-parser
const morgan     = require('morgan'); 		// used to see requests
const mongoose   = require('mongoose');
const helmet     = require('helmet');
const glob       = require("glob")
const auth       = require("./auth.controller");
const db         = require('mongoose');

//DB CONFIGURATION
db.connect('mongodb://localhost/pro-roof')
db.connection.on('error', console.error.bind(console, 'connection error:'));
db.connection.once('open', function() {
  // we're connected!
  console.log("DB connected")
});

// APP CONFIGURATION ---------------------
// use body parser so we can grab information from POST requests
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// configure our app to handle CORS requests
const domain = ''; //our domain
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', "*." + domain);//use *.domainName.domain for prod
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

// ROUTES FOR OUR API
// ======================================

app.get('/test',(req,res) => {
        res.json({msg : "no token required here"});
    })

app.post('/signup',auth.createUser);
app.post('/authenticate',auth.authenticateUser)

app.post('/generateOTP',(req,res,next) =>{ 
    console.log(req.body.mobile) 
    next()
},auth.generateOTP);
app.post('/verifyOTP',auth.verifyOTP);


// get an instance of the express for protected api
const apiRouter = express.Router();
// get an instance of the express for open api
const openRouter = express.Router();


// route middleware to verify a token
apiRouter.use(auth.verifyToken);
// api endpoint to get user information
apiRouter.get('/me', (req, res) => {
	res.send(req.user);
});

// log all requests to the console
app.use(morgan('dev'));

//glob user routes
glob('./*/*.routes.js',null,(err,files) => {
    files.map((path)=>{
        require('.'+path)(openRouter,apiRouter)
    })
}) 

// REGISTER OUR ROUTES -------------------------------
app.use('/api', apiRouter);
app.use(openRouter);

module.exports = (cache) => {
    auth.setCache(cache);
    return app
}