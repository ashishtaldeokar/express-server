const authCtrl = require('../helper/auth.controller')
module.exports = (openRoutes,apiRoutes) =>  {
    openRoutes.route('/authenticate')
        .post(authCtrl.authenticate);

    openRoutes.route('/verifyOTP')
        .post(authCtrl.verfiyOTP);

    openRoutes.route('/generateOTP')
        .post(authCtrl.generateOTP);    

    apiRoutes.route('/logout')
        .post(authCtrl.logout)
        .get(authCtrl.logout);

    apiRoutes.route('/me')
        .get(authCtrl.me)    
}