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
        let news = Model.find(function (err, news) {
            if (err) return err;
            /*Model.findAndFilter({dateParse: {$gte: +dateFrom}}).then(news => {
                resolve(news);
            })*/
            resolve(news);
        });
    });

}

function getNewsByType(newsS, isShort){
    let newsSRes = [];
    newsS.map(news => {
        if(news._doc.shortNew === isShort){
            newsSRes.push(news);
        }
    });
    return newsSRes;
}


router.get("/CBSS", function (req, res) {
    getLatestNews(CBSS)
        .then(news => {
            let shortNews = getNewsByType(news, true);
            let longNews = getNewsByType(news, false);
            res.render("newsPage", {shortNews: shortNews, longNews: longNews, title: "CBS SPORTS" })
        })
        .catch(() => {
            res.statusCode(500).render("error", {error : new LoadNewsError()});
        });
});

router.get("/Bleacher", function (req, res) {
    getLatestNews(Bleacher)
        .then(news => {
            let shortNews = getNewsByType(news, true);
            let longNews = getNewsByType(news, false);
            res.render("newsPage", {shortNews: shortNews, longNews: longNews, title: "Bleacher" })
        })
        .catch(() => {
            res.statusCode(500).render("error", {error : new LoadNewsError()});
        });
});

router.get("/NBS", function (req, res) {
    getLatestNews(NBCS)
        .then(news => {
            let shortNews = getNewsByType(news, true);
            let longNews = getNewsByType(news, false);
            res.render("newsPage", {shortNews: shortNews, longNews: longNews, title: "NBCS Sports" })
        })
        .catch(() => {
            res.statusCode(500).render("error", {error : new LoadNewsError()});
        });
});

router.get("/SBNation", function (req, res) {
    getLatestNews(SBNation)
        .then(news => {
            let shortNews = getNewsByType(news, true);
            let longNews = getNewsByType(news, false);
            res.render("newsPage", {shortNews: shortNews, longNews: longNews, title: "SB Nation" })
        })
        .catch(() => {
            res.statusCode(500).render("error", {error : new LoadNewsError()});
        });
});

router.get("/ESPN", function (req, res) {
    getLatestNews(ESPN)
        .then(news => {
            let shortNews = getNewsByType(news, true);
            let longNews = getNewsByType(news, false);
            res.render("newsPage", {shortNews: shortNews, longNews: longNews, title: "ESPN" })
        })
        .catch(() => {
            res.statusCode(500).render("error", {error : new LoadNewsError()});
        });
});

module.exports = router;
