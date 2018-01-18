const express = require('express');
const router = express.Router();
const LoadNewsError = require("../customErrors");

const models = require("../models");
const NBCS = models.NBCS;
const CBSS = models.CBSS;
const ESPN = models.ESPN;
const Bleacher = models.Bleacher;
const SBNation = models.SBNation;


router.get('/', function (req, res) {
    res.render('index', {title: 'Express'});
});


function getLatestNews(Model) {
    let dateFrom = new Date();
    dateFrom.setMinutes(dateFrom.getMinutes() - 20);

    return new Promise(function (resolve, reject) {
        let news = Model.find(function (err) {
            if (err) return err;
            Model.findAndFilter({dateParse: {$gte: +dateFrom}}).then(news => {
                resolve(news);
            })
        });
    });

}


router.get("/CBSS", function (req, res) {
    getLatestNews(CBSS)
        .then(news => {
            res.render("newsPage", {news : news})
        })
        .catch(() => {
            res.statusCode(500).render("error", {error : new LoadNewsError()});
        });
});

router.get("/Bleacher", function (req, res) {
    getLatestNews(Bleacher)
        .then(news => {
            res.render("newsPage", {news: news, title: "BLEACHER"})
        })
        .catch(() => {
            res.statusCode(500).render("error", {error : new LoadNewsError()});
        });
});

router.get("/NBS", function (req, res) {
    getLatestNews(NBCS)
        .then(news => {
            res.render("newsPage", {news : news})
        })
        .catch(() => {
            res.statusCode(500).render("error", {error : new LoadNewsError()});
        });
});

router.get("/SBNation", function (req, res) {
    getLatestNews(SBNation)
        .then(news => {
            res.render("newsPage", {news : news})
        })
        .catch(() => {
            res.statusCode(500).render("error", {error : new LoadNewsError()});
        });
});

router.get("/ESPN", function (req, res) {
    getLatestNews(ESPN)
        .then(news => {
            res.render("newsPage", {news : news})
        })
        .catch(() => {
            res.statusCode(500).render("error", {error : new LoadNewsError()});
        });
});

module.exports = router;
