const mongoose = require('mongoose')





const userschema = new mongoose.Schema({
    name: String,
    stack: String,
    shadowreport: String,
    trackedCompanies: String,


})


module.exports = mongoose.model("User", userschema);