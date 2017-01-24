const Company          = require('../models/company.model');
const User             = require('../models/user.model')
module.exports = {
    createCompany  : (req,res) => {
        //create a company (super admin)
        let data = req.body;
        data.providerData = {};
        data.providerData.addedBy = {_id : req.user['_id'], email : req.user['email'], name : req.user['firstName']+ " " +req.user['lastName']};
        Company(req.body).save((err,company) => {
            if(company)
                 return res.json(company);
            else
                 return res.json(err);
        })
    },
    listAllCompany    : (req,res) => {
        //list all employees in company (super admin)
        //TODO : pagination
        Company.find({}).limit(10).exec((err,list) => {
            if(list.length > 0)
                return res.json(list)
            else{
                return res.json(list)
            }    
        })
    },
    getEmployeeById    : (req,res) => {
        if(req.params.emp_id){
            User.findOne({_id : req.params.emp_id}).exec((err,emp) => {
                if(emp){
                    //remove sensitive data
                    emp. password = emp.salt = emp.created = emp.updated = undefined;
                    emp.webToken = emp.mobileToken = emp.authorizationCode = undefined;
                    return res.json(emp)
                }
                else{
                    return res.json({error : 200 , message : "no params found"})
                }
            })
        }
        else{
            return res.json({error : 400 , message : "no params found"})
        }
    },
    getCompanyById     : (req,res) => {
        //get 1 employee using _id

        if(req.params.cmp_id)
            Company.findOne({_id : req.params.cmp_id}).exec((err,company) => {
                return res.json(company);
            })
        else{
            return res.json({error : 400, message : "no params found"})
        }    
    },
    updateCompanyById  : (req,res) => {
        //update 1 employee using _id
        let data = req.body;
        let cmp_id = req.params.cmp_id;
        data.providerData = {};
        data.providerData.updatedBy = {_id : req.user['_id'], email : req.user['email'], name : req.user['firstName']+ " " +req.user['lastName']};
        if(cmp_id){
            Company.findOneAndUpdate({_id : cmp_id}, data,(err,result)=>{
                if(result){
                    return res.json(result)
                }
                else
                    return res.json({error : 500 , message : err.message});
            })
        }
        else{
            return res.json({error : 403, message : "INVALID REQUEST"})
        }
    },
    createCompanyAdmin  :   (req,res) => {
        //(super admin)
        let admin = req.body;
        admin.designation = 'admin';
        admin.companyId = req.params.cmp_id;
        if(req.params.cmp_id)
        Company.findOne({_id : req.params.cmp_id}).exec((err,company) => {
            if(company.companyAdmin)
                return res.json({error : 400, message : "Admin for this company already exist"})
            else{
                User(admin).save((err,user) => {
                    if(user){
                        Company.update(
                        {_id : req.params.cmp_id},
                        {companyAdmin : user._id},
                        (err,company) =>{
                            if(company)
                                return res.json({error : false, message : "company admin added"})
                            else
                                return res.json(err.message)
                        })
                    }
                    else    
                        return res.json({error : 400, message : err.message});    
                })
            }    
        })
    },

    updateCompanyAdmin  :(req,res) => {
        //update admin details of a company (super admin)

    },

    createManager       : (req,res) => {
            //create a manager in company (company admin)
        let admin = req.user;    
        let manager = req.body;
        manager.designation = 'manager';
        manager.companyId = admin.companyId;
        manager.providerData = {addedBy : {_id : admin._id, name : admin.firstName + " " + admin.lastName}}
        User(manager).save((err,user) => {
            if(user){
                Company.findByIdAndUpdate(admin.companyId,
                    {$push : {"companyManagers" : user._id}},
                    {safe : true, upsert : true, new : true},
                    (err,result) => {
                        if(result)
                            return res.json(result)
                        else
                            return res.status(500).json({error : 500 , message : err.message})    
                })
            }
            else{
                return res.status(403).json({error : 403 , message : err.message})                
            }
        })
    },

    updateManager       : (req,res) => {
        let admin = req.user;
        let manager_id = req.params.manager_id;
        let manager = req.body;
        manager.updated = Date.now();
        if(manager_id){
            User.findOneAndUpdate({_id : manager_id}, manager,(err,result)=>{
                if(result){
                    return res.json(result)
                }
                else
                    return res.json({error : 500 , message : err.message});
            })
        }
        else{
            return res.json({error : 403, message : "INVALID REQUEST"})
        }
        
    },

    createRoofer        : (req,res) => {
        let admin = req.user;    
        let roofer = req.body;
        roofer.designation = 'roofer';
        roofer.companyId = admin.companyId;
        roofer.password = null;
        roofer.providerData = {addedBy : {_id : admin._id, name : admin.firstName + " " + admin.lastName}}
        User(roofer).save((err,user) => {
            if(user){
                Company.findByIdAndUpdate(admin.companyId,
                    {$push : {"companyRoofers" : user._id}},
                    {safe : true, upsert : true, new : true},
                    (err,result) => {
                        if(result)
                            return res.json(result)
                        else
                            return res.status(500).json({error : 500 , message : err.message})    
                })
            }
            else{
                return res.status(403).json({error : 403 , message : err.message})                
            }
        })
    },
    updateRoofer        : (req,res) => {
        let updater = req.user;
        let roofer_id = req.params.roofer_id;
        let roofer = req.body;
        roofer.updated = Date.now();
        roofer.providerData.lastUpdatedBy = updater._id;
        if(roofer_id){
            User.findOneAndUpdate({_id : roofer_id}, roofer,(err,result)=>{
                if(result){
                    return res.json(result)
                }
                else
                    return res.json({error : 500 , message : err.message});
            })
        }
        else{
            return res.json({error : 403, message : "INVALID REQUEST"})
        }
    }

}