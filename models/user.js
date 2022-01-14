var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');


var User = new Schema({ //username and pw will be added in by passportlocalmongoose
    // username: {          
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    // password: {
    //     type: String,
    //     required: true
    // },
    firstname: {
        type: String,
        default: '',
    },
    lastname: {
        type: String,
        default: '',
    },
    admin: {
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose); //adds in support for username and hashed storage of pw using salt? and add additional methods on the user schema and model which are useful for passport authentication


module.exports = mongoose.model('User', User);