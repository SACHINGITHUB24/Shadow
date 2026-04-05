const mongoose = require('mongoose')


mongoose.connect(process.env.MONGODB_URI)


const userschema = new mongoose.Schema({

    name: String,
    userinput:String,
    alldatastr: String,
    aireport: String,
    stack: String,
    scheduling: Boolean,
    trackedcompany: String,
    lastgeneratedat: Date,
    interview: String,
    mock: String,
    
    
    

}, {timestamps: true})


module.exports = mongoose.model("User", userschema);