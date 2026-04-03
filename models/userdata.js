const mongoose = require('mongoose')


mongoose.connect(process.env.MONGODB_URI)


const userschema = new mongoose.Schema({
    name: String,
    stack: String,
    shadowreport: String,
    trackedCompanies: String,


})


module.exports = mongoose.model("User", userschema);