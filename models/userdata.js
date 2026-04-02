const mongoose = require('mongoose')


mongoose.connect('mongodb+srv://SHADOW:SHADOW@shadow.xdxbmkz.mongodb.net/?appName=Shadow')


const userschema = new mongoose.Schema({
    name: String,
    stack: String,
    shadowreport: String,
    trackedCompanies: String,


})


module.exports = mongoose.model("User", userschema);