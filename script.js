var jwt 	   = require('jsonwebtoken');
var superSecret = 'secret_for_jwt';

var token = jwt.sign({
                        mob: 123 // expires in 24 hours
                    }, superSecret);

jwt.verify(token, superSecret, function(err, decoded) {
        if (err) {
            console.log('Failed to authenticate token.');
        } else {
        // if everything is good, save to request for use in other routes
            console.log(decoded)
}})