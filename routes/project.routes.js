const project   = require('../controllers/project.controller')
const auth      = require('../helper/auth.controller')
const policy    = require('../helper/policy');

module.exports  = (openRoutes,apiRoutes) =>  {

    apiRoutes.route('/createProject').all(policy.isAdmin)
        .post(project.createproject)        // TODO : create project

    apiRoutes.route('/listAllProjects').all(policy.isAdmin)
        .get(project.listAllProjects)       // TODO : list all projects

    apiRoutes.route('/createProjectManager/:proj_id').all(policy.isAdmin)
        .post(project.createProjectManager) // TODO : create manager    

    apiRoutes.route('/getProjectById/:cmp_id')
        .get(project.getProjectById)        // TODO : Get 1 project by id

    apiRoutes.route('/updateProjectById/:cmp_id')
        .put(project.updateProjectById)     // TODO : update 1 project by id




}