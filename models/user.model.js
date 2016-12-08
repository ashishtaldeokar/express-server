'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * User Schema
 */

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
		trim: true
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
		trim: true,
		default : 'not yet provided'
	},
	token: {
		type: [{
			type : String
		}],
		//required: 'No token provided!',
		//validate: [validateToken, 'Token Invalid']
	},
	password:{
		type : String,
	},
	provider: {
		type: String,
		//required: 'Provider is required'
	},
	providerData: {},
	additionalProvidersData: {},
	roles: {
		type: [{
			type: String,
			enum: ['roofer', 'admin', 'team_leader']
		}],
		default: ['roofer']
	},
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
UserSchema.pre('save', (next) => {
	//var self = this;
	console.log("data here is",this)
	next();
});

/**
 * Hook validations for saving data
 */
var validateName = (name) => {
    //check for invalid names
    return /^[a-zA-Z ]{3,}$/.test(name)
}

var validateToken = (token) => {
    //validate token
    return true
}


module.exports = mongoose.model('User', UserSchema);