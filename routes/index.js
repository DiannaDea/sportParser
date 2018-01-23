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
            let groupedByDate =  _.groupBy(news, function (obj) {
                let millisec = parseInt(obj._doc.dateParse);
                return parseDate(millisec);
            });

            let groupedByDatesAndTime = {};
            for(let date in groupedByDate){
                let groupedByTime = _.groupBy(groupedByDate[date], function (obj) {
                    let millisec = parseInt(obj._doc.dateParse);
                    return parseTime(millisec);
                });
                groupedByDatesAndTime[date] = groupedByTime;
            }
            //console.log(groupedByDatesAndTime);
            return groupedByDatesAndTime;

        })
}

function parseDate(milliseconds) {
    let date = new Date(milliseconds);
    return date.getFullYear() + "-" + (((date.getMonth() + 1) < 10) ? "0" : "") + (date.getMonth() + 1) + "-" + ((date.getDate() < 10) ? "0" : "") + date.getDate();
}

function parseTime(milliseconds){
    let date = new Date(milliseconds);
    let temp = ((date.getHours() < 10) ? "0" : "") + date.getHours() + ":" + ((date.getMinutes() < 10) ? "0" : "") + date.getMinutes() + ":00"

    return temp;
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

function getDateAndTimeRanges(news){
    let datesAndTimes = {};
    let newsDates = Object.keys(news);
    newsDates.map(date => {
        datesAndTimes[date] = Object.keys(news[date])
    });
    return datesAndTimes;
}

function renderLatestNews(req, res) {
    getAllNewsGroupedByDates(this.Model)
        .then(news => {
            let dateAndTimeNews = getDateAndTimeRanges(news);
            //console.log(dateAndTimeNews);
            let datesOfNews = Object.keys(dateAndTimeNews);
            let latestDate = datesOfNews[datesOfNews.length - 1];


            let timesOfLatestNews = dateAndTimeNews[latestDate];

            let latestTime = timesOfLatestNews[timesOfLatestNews.length-1];

            let latestNews = news[latestDate][latestTime];

            let shortNews = getNewsByType(latestNews, true);
            let longNews = getNewsByType(latestNews, false);
            res.render("newsPage", {
                shortNews,
                longNews,
                latestDate,
                latestTime,
                countNews : timesOfLatestNews.length,
                title: this.Model.modelName,
                datesAndTimesNews : JSON.stringify(dateAndTimeNews)
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
            let selectedNews = news[req.params.date][req.params.time];
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

router.get("/:siteName/:date/:time", renderFilteredNews);

module.exports = router;
