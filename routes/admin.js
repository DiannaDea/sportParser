const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const schedule = require('node-schedule');
const Admin = require("../models/admin");
const getNews = require("../parse_module");

router.get('/', function (req, res) {
    /*const admin = new Admin({ login: '123', password : '123' });
    bcrypt.hash(admin.password, 10, function(err, hash) {
        admin.password = hash;
        admin.save(function (err) {
            if (err) return console.error(err);
            else{
                console.log("Saved")
            }
        });
    });*/
    res.render('./admin/login');

});

router.post("/login", function (req, res) {
    Admin.findOne({ 'login': req.body.login}, function (err, admin) {
        if(admin === null) res.status(401).send({status: "Incorrect login or password"});
        else{
            bcrypt.compare(req.body.password, admin.password, function(err, result) {
                if(result) {
                    let session = req.session;

                    req.session.admin = admin;
                    res.status(200).send({status: "Successfully logged", userName : req.body.login});
                } else {
                    res.status(401).send({status: "Incorrect login or password"});
                }
            });
        }

    });
});

router.get("/:adminName/changePassword", function (req, res) {
    res.render("./admin/passwordChange", {adminName : req.params.adminName});
});

router.get("/:adminName", function (req, res) {
    Admin.findOne({ 'login': req.params.adminName}, function (err, admin) {
        res.render('./admin/parseSelect', {adminName : admin.login});
    })
});

router.post("/:adminName/changePassword", function (req, res) {
    Admin.findOne({ 'login': req.params.adminName}, function (err, admin) {
        bcrypt.compare(req.body.oldPassword, admin.password, function(err, result) {
            if(!result) res.status(401).send({status: "Old password isn't valid"});
            else{
                bcrypt.hash(req.body.newPassword, 10, function(err, hash) {
                    admin.password = hash;
                    admin.save(function (err) {
                        if (err) return console.error(err);
                        else{
                            res.status(200).send({status: "Successfully changed", userName : req.params.adminName});
                        }
                    });
                });
            }
        });

    })
});

router.post("/setParse/:adminName", function (req, res) {
    Admin.findOne({ 'login': req.params.adminName}, function (err, admin) {
        if(req.body.time){
            admin.parseTime = req.body.time;
        }
        else{
            admin.parseTime = req.body.day;
        }
        admin.save(function (err) {
            if (err) return console.error(err);
            else{
                res.status(200).send({status: "Successfully changed", userName : req.params.adminName});
            }
        });
    })
});

router.post("/startParse", function (req, res) {
    let admin = req.session.admin;
    let parseTime = admin.parseTime;
    let timeParse;
    let timeArr = parseTime.split(":");
    if(timeArr.length === 2){
        let hours = timeArr[0];
        hours[0] === "0"? hours = hours[1] : hours;
        let minutes = timeArr[1];
        minutes[0] === "0" ? minutes = minutes[1] : minutes;
        if(hours === "0") timeParse = `*/${minutes} * * * *`;
        else if(minutes === "0") timeParse = `* */${hours} * * *`;
        else timeParse = `*/${minutes} */${hours} * * *`;
    }
    else{
        timeParse = `* * */${parseTime} * *`
    }
    console.log(timeParse);

    schedule.scheduleJob("parseTime", timeParse, function () {
        getNews();
    });
    console.log("Parsing started, time: " + parseTime);
    res.status(200).send("Parsing started")
});

router.post("/stopParse", function (req, res) {
    const timer = schedule.scheduledJobs["parseTime"];
    timer.cancel();
    console.log("Parsing stopped");
    res.status(200).send("Parsing stopped")
});

module.exports = router;