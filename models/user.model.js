'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');	

/**
 * User Schema
 */

var model;

var UserSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		default: 'not yet provided',
		//validate: [validateName, 'Please fill in your first name']
	},
	lastName: {
		type: String,
		trim: true,
		default: 'not yet provided',
		//validate: [validateName, 'Please fill in your last name']
	},
	displayName: {
		type: String,
		trim: true,
		default : 'not yet provided'
	},
	email: {
		type: String,
		trim: true,
		unique: true,
		default: '',
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	mobile: {
		type: String,
		required : true,
		unique	: true,
		default : 'not yet provided'
	},
	webToken : {
		type : String
	},
	mobileToken : {
		type : String
	},
	password:{
		type : String,
	},
	salt : {
		type : String
	},
	provider: {
		type: String,
		//required: 'Provider is required'
	},
	designation : {
		type : String,
		enum: ['admin','manager','roofer']
	},
	providerData: {},
	authorizationCode : {
		type : Number
	},
	companyId : {
		type : String,
		required : "Company id required"
	},
	projects : {
		type : [{
			project_id : String,
			roles : {
				type :[{
	 				type: String,
	 				enum: ['roofer', 'team_leader', 'service_man']
	 			}],
				default : 'roofer'
			}
		}]
	},
	isActive : {
			type : Boolean
		},
	additionalProvidersData: {},
	// roles: {
	// 	type: [{
	// 		type: String,
	// 		enum: ['roofer', 'admin', 'team_leader']
	// 	}],
	// 	default: ['roofer']
	// },
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	}
});

/**
 * Hook a pre save method
 */

UserSchema.pre("save", function(next) {
	console.log("saving user")
	let self = this;
	if(!self.mobile && !self.email)
		return next(new Error("Please provide email and mobile"))

	if(self.designation === 'roofer'){
		model.findOne({mobile : self.mobile}, 'mobile' , function(err,result){
			if(err){
				return next(err);
			}
			else if(result){
				return next(new Error("Mobile already exist"));
			}

			self.authorizationCode = 8;
			return next();
		})
	}	

	model.findOne({email : self.email}, 'email',function(err,result){
		if(err){
			return next(err);
		}
		else if(result){
			return next(new Error("Email already exist"));
		}

		if (self.password && self.isModified('password')) {
    		self.salt = crypto.randomBytes(16).toString('base64');
    		self.password = self.hashPassword(self.password);
  		}
		switch (self.designation) {
			case 'admin' :
				self.authorizationCode = 14;
				break;
			case 'manager':
				self.authorizationCode = 12;
				break;
			default :
				self.authorizationCode = 8;
				break;		
		}
		next();
	})
});

UserSchema.methods.hashPassword = function (password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64, 'SHA1').toString('base64');
  } else {
    return password;
  }
};


UserSchema.methods.authenticate = function (password) {
  return this.password === this.hashPassword(password);
};


/**
 * Hook validations for saving data
 */
let validateName = (name) => {
    //check for invalid names
    return /^[a-zA-Z ]{3,}$/.test(name)
}

let validateToken = (token) => {
    //validate token
    return true
}


module.exports = model = mongoose.model('User', UserSchema);