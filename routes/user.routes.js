'use strict'
module.exports = function(openRouter,apiRouter){
    var users = require('../controllers/user.controller');

    openRouter.route('/user/:id')
        .get(users.getUserById)
        .delete(users.deleteUserById);
    apiRouter.route('/user/:id')
        .get(users.getUserById);
}