const company   = require('../controllers/company.controller')
const auth      = require('../helper/auth.controller')
const policy    = require('../helper/policy');

module.exports  = (openRoutes,apiRoutes) =>  {
//company
    apiRoutes.route('/createCompany').all(policy.isSuperAdmin)  //POST
        .post(company.createCompany)    //working

    apiRoutes.route('/listAllCompany').all(policy.isSuperAdmin) //GET
        .get(company.listAllCompany)    //working

    apiRoutes.route('/createCompanyAdmin/:cmp_id').all(policy.isSuperAdmin) //POST
        .post(company.createCompanyAdmin)   //working    

    apiRoutes.route('/getCompanyById/:cmp_id')  //GET
        .get(company.getCompanyById)

    apiRoutes.route('/updateCompanyById/:cmp_id')   //PUT
        .put(company.updateCompanyById)    
//employee
    apiRoutes.route('/getEmployeeById/:emp_id').all(policy.isSuperAdmin)
        .get(company.getEmployeeById);

    apiRoutes.route('/createManager').all(policy.isAdmin)   //POST
        .post(company.createManager)
    apiRoutes.route('/updateManager/:manager_id').all(policy.isAdmin)   //PUT
        .put(company.updateManager)
        
    apiRoutes.route('/createRoofer').all(policy.isManager)  //POST
        .post(company.createRoofer)
    apiRoutes.route('/updateRoofer/:roofer_id').all(policy.isManager)  //PUT
        .put(company.updateRoofer)    


}