const nodeCache     = require("node-cache");
var cache           = new nodeCache();
const request       = require("request");
const jwt 	        = require('jsonwebtoken');
const superSecret   = 'xyz';
const db            = require('mongoose')
const User          = require('../models/user.model');

//=========================export functions=======================================
//function generateOTP :
exports.setCache = (cacheObj) => {
    this.cache = cacheObj;
}

module.exports.authenticateUser = (req,res) => {
    if(isValidEmail(req.body.email) && isValidPass(req.body.password)){
        User.findOne({email : req.body.email, password : req.body.password},(err,user) => {
            if(err || !user){
               return res.json({
                            verified: false,
                            message: 'No token for you!'
                        });
            }
            else{

                let token = jwt.sign({
                        _id: user._id,
                        roles : user.roles
                    }, superSecret);
                user.token.push(token);
                User.findByIdAndUpdate({_id : user._id},user,(err,user) => {
                    if(err){
                        return res.json({
                                verified: false,
                                message: 'Server Error'
                            });
                    }
                    else{
                        return res.json({
                            verified: true,
                            message: 'Enjoy your token!',
                            token: token
                        });
                    }    
                })
            }    
        })
    }
}

module.exports.createUser = (req,res) => {
    //console.log(req.body)
    
    if(isValidEmail(req.body.email) && isValidPass(req.body.password)){
        let user = new User(req.body)
        let token = jwt.sign({
                        _id: user._id,
                        roles : user.roles
                    }, superSecret);
        user.token = token;            
        user.save((err) => {
            if(err){
                if(err.code == 11000)
                    return res.json({success : false, message : "email already exist"})
                 else
                    return res.json({success : false, message : "Internal server error"})   
            }
            else{
                // return the information including token as JSON
                return res.json({
                    verified: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }
                    
        })
    }
    else{
        return res.json({success : false});
    }
}



module.exports.generateOTP = (req,res) => {
    if(req.body.mobile){
        var otp = 1000 + Math.floor(Math.random() * 8999);
        console.log(otp);
        cache.set(req.body.mobile, otp, 100, (err,success) => {
            if(success){
                sendOTP(req.body.mobile,otp);
                return res.json({msg : "OTP sent successfully", error : false});
            }
            else{
                return res.json({msg : "OTP not sent", error : true});
            }
        });
    }
    else{
        return res.json({msg : "Provide mobile", error : true});
    }
}

//function verifyOTP :
module.exports.verifyOTP = (req,res) => {
    var clientotp = req.body.otp;
    cache.get(req.body.mobile,(err,val) => {
        if(!err){
            var serverotp = val;
            if(clientotp == val){
                //otp verified TODO: create user
            var token = jwt.sign({
                        mob: req.body.mobile
                    }, superSecret);
                // return the information including token as JSON
                return res.json({
                    verified: true,
                    message: 'Enjoy your token!',
                    token: token
                });
                
            }
            else{
                //otp wrong
                return res.json({msg : "incorrect otp or expired" , verified : false});
            }
        }
        else{
            //cache error
            return res.json({msg : "server error", verified : false});
        }
    });
}

//verify Token on each api request fired
module.exports.verifyToken = (req, res, next) => {
	// do logging
	console.log('Somebody authenticated just came to our app!');
  // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // decode token
    if (token) {
    // verifies secret and checks exp
        jwt.verify(token, superSecret, (err, decoded) => {
        if (err) {
            return res.json({ success: false, message: 'Failed to authenticate token.' });
        } else {
        // if everything is good, save to request for use in other routes
            User.findById(decoded._id,(err,user) => {
                
                if(user){
                    console.log(token)
                    user.token = user.password = undefined;
                    req.user = user;
                    next(); // make sure we go to the next routes and don't stop here
                }
                else
                    return res.json({success: false, message: 'token not valid'})    
            })
            
        }
    });
  } else {
    // if there is no token
    // return an HTTP response of 403 (access forbidden) and an error message
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
}

//=========================non export functions=======================================

const sendOTP = (phone,otp) => {
    let msg = otp + " is your OTP code for Meher app";
    let url = "https://enterprise.smsgupshup.com/GatewayAPI/rest?method=SendMessage&send_to=";
    url += '91' + phone + '&msg=' + encodeURI(msg);
    url += '&msg_type=TEXT&userid=2000141701&password=Gandhi007&auth_scheme=PLAIN';
    request({
          url: url,
          method: "GET"
        }, 
        function _callback(err, response, SMSbody) {
            console.log(response.body)
        
    });
}

const isValidEmail = (email) => {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
}

const isValidPass = (pass) => {
    return /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(pass)
}
