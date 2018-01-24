const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schemaAdmin = {
    login: "String",
    password : "String",
    parseTime: {type: String, default: "00:20"}
};

const Admin = new Schema(schemaAdmin);


module.exports = mongoose.model('Admin', Admin);