const express = require('express');
const router = express.Router();
const LoadNewsError = require("../customErrors").LoadNewsError;
const NoNewsRecentlyError = require("../customErrors").NoNewsRecentlyError;
const _ = require('lodash');

const models = require("../models");

router.get('/', function (req, res) {
    res.render('index', {title: 'Express'});
});

function getAllNewsGroupedByDates(Model) {
    return Model.findAndFilter()
        .then(news => {
            if (news.length === 0) throw new NoNewsRecentlyError;
            return _.groupBy(news, function (obj) {
                let millisec = parseInt(obj._doc.dateParse);
                return parseDate(millisec);
            });
        })
}

function parseDate(milliseconds) {
    let date = new Date(milliseconds);
    date.setSeconds(0);
    return date;
}

function getNewsByType(newsS, isShort) {
    return newsS.filter(news => {
        return news._doc.shortNew === isShort
    });
}

function getModel(siteName) {
    switch (siteName) {
        case("CBSS"):
            return models.CBSS;
        case("BLEACHER"):
            return models.Bleacher;
        case("NBCS"):
            return models.NBCS;
        case("SBNation"):
            return models.SBNation;
        case("ESPN"):
            return models.ESPN;
    }
}

function renderLatestNews(req, res) {
    getAllNewsGroupedByDates(this.Model)
        .then(news => {
            let newsGroups = Object.keys(news);
            let latestNews = news[newsGroups[newsGroups.length - 1]];
            let shortNews = getNewsByType(latestNews, true);
            let longNews = getNewsByType(latestNews, false);
            res.render("newsPage", {
                shortNews,
                longNews,
                title: this.Model.modelName,
                newsGroups: JSON.stringify(newsGroups),
                countGroups: newsGroups.length
            })
        })
        .catch(() => {
            res.statusCode(500).render("error", {error: new LoadNewsError()});
        });
}

function renderFilteredNews(req, res) {
    let Model = getModel(req.params.siteName);
    getAllNewsGroupedByDates(Model)
        .then(news => {
            let selectedNews = news[new Date(req.params.date)];
            let shortNews = getNewsByType(selectedNews, true);
            let longNews = getNewsByType(selectedNews, false);
            res.send({shortNews, longNews})
        })
        .catch(() => {
            res.statusCode(500).render("error", {error: new LoadNewsError()});
        });
}

router.get("/CBSS", renderLatestNews.bind({Model: models.CBSS}));

router.get("/Bleacher", renderLatestNews.bind({Model: models.Bleacher}));

router.get("/NBS", renderLatestNews.bind({Model: models.NBCS}));

router.get("/SBNation", renderLatestNews.bind({Model: models.SBNation}));

router.get("/ESPN", renderLatestNews.bind({Model: models.ESPN}));


router.get("/:siteName/:date", renderFilteredNews);

module.exports = router;
