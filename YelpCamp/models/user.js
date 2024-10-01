const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});
UserSchema.plugin(passportLocalMongoose); //This is going to add on a field for Username, password etc. It makes sure that the they are unique and also provides with some additional methods that we can use.
module.exports = mongoose.model('User', UserSchema);