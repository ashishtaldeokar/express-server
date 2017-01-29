/**
 * Desc: Authentication controller functions that compute auth task communicating with database 
 */
const nodeCache     = require("node-cache");
let cache           = new nodeCache();
const request       = require("request");
const jwt 	        = require('jsonwebtoken');
const superSecret   = 'xyz';
const User          = require('../models/user.model');


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

module.exports = {
    setCache : (c)=>{
       //cache = c;
    },

    me : (req,res) => {
        let me = req.user;
        //remove sensitive data
        me.password = me.salt = me.created = me.updated = undefined;
        me.webToken = me.mobileToken = me.authorizationCode = undefined;
        return res.json(me);
    },
    authenticate : (req, res) => {
                        console.log(isValidPass(req.body.email))
                        if(isValidEmail(req.body.email) && isValidPass(req.body.password)){
                            User.findOne({email : req.body.email},(err,user) => {
                                console.log(User(user).authenticate(req.body.password))
                                if(!User(user).authenticate(req.body.password)){
                                    return res.status(401).json({
                                        verified: false,
                                        message: 'No token for you!'
                                    });
                                }
                                else{

                                    let token = jwt.sign({
                                        _id: user._id,
                                        mobile : user.mobile
                                    }, superSecret,{ expiresIn : 60 * 60 * 24});
                                    user.webToken = token;
                                    user.providerData = { lastLogin : Date.now() };
                                    User.findByIdAndUpdate({_id : user._id},user,(err,user) => {
                                        if(err){
                                            return res.json({
                                                verified: false,
                                                message: 'Server Error',
                                                status : 500
                                            });
                                        }
                                        else{
                                            //remove sensitive data
                                            user.password = user.salt = user.created = user.updated = undefined;
                                            user.webToken = user.mobileToken = user.authorizationCode = undefined;
                                            return res.json({
                                                verified: true,
                                                user: user,
                                                token: token,
                                                status : 200
                                            });
                                        }    
                                    })
                                }    
                            })
                        }
                        else{
                            return res.status(400).json({status : 403, message : "Invalid credential format"})
                        }
                    },
    logout : (req,res) => {
        return res.json({message : "functionality not added yet"})
    },

    verfiyOTP :  (req,res) => {
                    var clientotp = req.body.otp;
                    cache.get(req.body.mobile,(err,val) => {
                    if(!err){
                        if(val){
                            let serverotp = val.value;
                            if(clientotp == serverotp){
                                // and store token in user as mobileToken : token
                                var token = jwt.sign({
                                        _id : val._id,
                                        mobile : req.body.mobile,
                                    }, superSecret);
                                User.update({mobile : req.body.mobile},{mobileToken : token},(err,raw)=>{
                                console.log(err,raw)
                                });
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
                            return res.json({msg : "incorrect data" , verified : false});
                        }

                    }
                    else{
                            //cache error
                        return res.json({msg : "server error", verified : false});
                    }
                });
            },

    verfiyToken : (req, res, next) => {
                    //This is a middleware to compute validity of token
                    let token = req.headers['x-access-token'];
                    let platform = {};
                    if(req.headers['platform'])
                        platform = JSON.parse(req.headers['platform'])
                    if (token && platform.source) {
                        jwt.verify(token, superSecret, (err, decoded) => {
                            if (err) {
                                return res.status(500).json({ success: false, message: 'Failed to authenticate token.' });
                            } 
                            else {
                                User.findById(decoded._id,(err,user) => {
                                    if(user){
                                        //user.mobileToken = user.webtoken = user.salt = user.password = undefined;
                                        req.user = user;
                                        switch(platform.source){
                                            case 'web':
                                                console.log("Token claimed for web")
                                                if(user.webToken == token){
                                                    next(); // make sure we go to the next routes and don't stop here
                                                }
                                                else{
                                                    return res.status(401).json({success : false, message : "Token expired (logged in somewhere else)"});
                                                }
                                                break;
                                            case 'mobile':
                                                console.log("Token claimed for mobile")  
                                                if(user.mobileToken == token){
                                                    
                                                    next(); // make sure we go to the next routes and don't stop here
                                                }
                                                else{
                                                    return res.status(401).json({success : false, message : "Token expired (logged in somewhere else)"});
                                                }
                                                break;
                                            default:
                                                return res.status(500).json({success : false, message : "Invalid api usage, source not defined"});
                                        }
                                    }
                                    else
                                        return res.status(400).json({success: false, message: 'Invalid user or token expired'})    
                            })
            
                        }
                    });
                } else {
                    // if there is no token or platform headers
                    // return an HTTP response of 403 (access forbidden) and an error message
                    return res.status(403).send({
                        success: false,
                        message: 'Please provide token and platform'
                    });
                }
            },
    generateOTP : (req,res) => {
                    if(req.body.mobile){
                        let query = User.where({mobile : req.body.mobile});
                        query.findOne((err,user) => {
                            if(user){
                                let otp_val = 1000 + Math.floor(Math.random() * 8999);
                                let _id     = user._id;
                                let otp     ={value : otp_val, _id : _id}
                                console.log(otp);
                                cache.set(req.body.mobile, otp, 100, (err,success) => {
                                    if(success){
                                        console.log(success)
                                        sendOTP(req.body.mobile,otp.value);
                                        return res.json({msg : "OTP sent successfully", error : false});
                                    }
                                    else{
                                        console.log("error")
                                        return res.json({msg : "OTP not sent", error : true});
                                    }
                                });
                            }
                            else{
                                return res.json({error : true, message : "Mobile not Registered"});
                            }
                        });
                    }
                    else{
                        return res.json({msg : "Provide mobile", error : true});
                    }
                }

}
