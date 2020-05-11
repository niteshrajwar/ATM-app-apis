const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    cardNo: {type:String},
    pin:{type:String}
})

module.exports = mongoose.model('Card',userSchema);