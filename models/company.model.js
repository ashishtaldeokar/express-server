'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Company Schema
 */

var CompanySchema = new Schema({
	companyName: {
		type: String,
		trim: true,
		default: 'not yet provided'
	},
	companyAddress: {
		type: String,
		trim: true,
		default: 'not yet provided'
	},
	companyContact: {
		type: String,
		trim: true
	},
	companyPan: {
		type: String,
		trim: true,
		unique: true,
		default: '',
	},
	companyTan: {
		type: String,
		trim: true,
		default : 'not yet provided'
	},
    companyAdmin : {
        type : String
    },
	companyManagers : {
		type : [{
			type : String
		}]
	},
	companyRoofers : {
		type : [{
			type : String
		}]
	},
	companyLogo : {
		type : String
	},
	provider: {
		type: String,
		//required: 'Provider is required'
	},
	providerData: {},
	projects : {
		type : [{
			project_id : Schema.ObjectId,
		}]
	},
	isActive : {
			type : Boolean
		},
	additionalProvidersData: {},
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

CompanySchema.pre("save", (next) => {

	console.log("saving Company")
	next();
});

CompanySchema.pre("update", (next) => {

	console.log("updating Company")
	next();
});


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


module.exports = mongoose.model('Company', CompanySchema);