const express = require('express');
const router = express.Router();
const LoadNewsError = require("../customErrors").LoadNewsError;
const NoNewsRecentlyError = require("../customErrors").NoNewsRecentlyError;
const _ = require('lodash');

const models = require("../models");

router.get('/', function (req, res) {
    res.render('index', {title: 'Express'});
});

function getLatestNews(Model) {
    let dateFrom = new Date();
    dateFrom.setMinutes(dateFrom.getMinutes() - 20);
    return Model.findAndFilter({dateParse: {$gte: +dateFrom}})
        .then(news => {
            if (news.length === 0) throw new NoNewsRecentlyError;
            return news;
        })
}

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

function getNewsDates(Model) {
    return getAllNewsGroupedByDates(Model)
        .then(news => {
            return Object.keys(news);
        })
}

function parseDate(milliseconds) {
    let date = new Date(milliseconds);
    date.setSeconds(0);
    return date;
}

function renderLatestNews(req, res) {
    Promise.all([getLatestNews(this.Model), getNewsDates(this.Model)])
        .then(results => {
            let latestNews = results[0];
            let newsGroups = results[1];
            console.log(newsGroups);
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

function getNewsByType(newsS, isShort) {
    return newsS.filter(news => {
        return news._doc.shortNew === isShort
    });
}


router.get("/CBSS", renderLatestNews.bind({Model: models.CBSS}));

router.get("/Bleacher", renderLatestNews.bind({Model: models.Bleacher}));

router.get("/NBS", renderLatestNews.bind({Model: models.NBCS}));

router.get("/SBNation", renderLatestNews.bind({Model: models.SBNation}));

router.get("/ESPN", renderLatestNews.bind({Model: models.ESPN}));


module.exports = router;
