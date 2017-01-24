const Company          = require('../models/company.model');
const User             = require('../models/user.model');
const Project          = require('../models/project.model');

module.exports = {
    createproject   : (req,res) => {
        Project(req.body).save((err,project) => {
            if(err){
                return res.status(500).json({err : 500, message : "error fetching list"});
            }
            else{
                return res.json(project);
            }
        })
    },
    listAllProjects : (req,res) => {
        Project.find({_id : req.user.companyId}).exec((err,list) => {
            if(list){
                return res.json(list);
            }
            else{
                return res.status(500).json({err : 500, message : "error fetching list"});
            }
        })
    },
    createProjectManager:   (req,res) => {},
    getProjectById      :   (req,res) => {},
    updateProjectById   :   (req,res) => {}
}