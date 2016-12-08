'use strict'

module.exports = {
    getUserById : (req,res) => {
        res.json({working : req.params.id});

    },
    deleteUserById : (req,res) => {
        res.json({working : req.params.id})
    }
}