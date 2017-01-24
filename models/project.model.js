'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Project Schema
 */

var ProjectSchema = new Schema({
	projectName: {
		type: String,
		default: 'not yet provided'
	},
	projectDescription: {
		type: String,
		default: 'not yet provided'
	},
	tenderNumber: {
		type: String,
		trim: true
	},
    companyAdmin : {
        type : String
    },
	projectImage : {
		type : String
	},
	provider: {
		type: String,
		//required: 'Provider is required'
	},
	providerData: {},
    roofers : {
        type : [{
            _id : {
                type : String
            },
            name : {
                type : String
            }
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

ProjectSchema.pre("save", (next) => {

	console.log(this)
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


module.exports = mongoose.model('Project', ProjectSchema);