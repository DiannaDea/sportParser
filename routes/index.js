const express = require('express');
const router = express.Router();
const LoadNewsError = require("../customErrors").LoadNewsError;
const NoNewsRecentlyError = require("../customErrors").NoNewsRecentlyError;
const _ = require('lodash');

const models = require("../models");


router.get('/', renderTopNews);

function getAllNewsGroupedByDates(Model) {
    return Model.findAndFilter()
        .then(news => {
            if (news.length === 0) throw new NoNewsRecentlyError;
            let groupedByDate = _.groupBy(news, function (obj) {
                let millisec = parseInt(obj._doc.dateParse);
                return parseDate(millisec);
            });

            let groupedByDatesAndTime = {};
            for (let date in groupedByDate) {
                let groupedByTime = _.groupBy(groupedByDate[date], function (obj) {
                    let millisec = parseInt(obj._doc.dateParse);
                    return parseTime(millisec);
                });
                groupedByDatesAndTime[date] = groupedByTime;
            }
            return groupedByDatesAndTime;

        })
}

function parseDate(milliseconds) {
    let date = new Date(milliseconds);
    return date.getFullYear() + "-" + (((date.getMonth() + 1) < 10) ? "0" : "") + (date.getMonth() + 1) + "-" + ((date.getDate() < 10) ? "0" : "") + date.getDate();
}

function parseTime(milliseconds) {
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
        case("Bleacher"):
            return models.Bleacher;
        case("NBCS"):
            return models.NBCS;
        case("SBNation"):
            return models.SBNation;
        case("ESPN"):
            return models.ESPN;
    }
}

function getDateAndTimeRanges(news) {
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
            let datesOfNews = Object.keys(dateAndTimeNews);
            let latestDate = datesOfNews[datesOfNews.length - 1];


            let timesOfLatestNews = dateAndTimeNews[latestDate];

            let latestTime = timesOfLatestNews[timesOfLatestNews.length - 1];

            let latestNews = news[latestDate][latestTime];

            let shortNews = getNewsByType(latestNews, true);
            let longNews = getNewsByType(latestNews, false);
            let className = "container-short-news shadow-wrap";
            if(longNews.length === 0) className += " costyl";
            res.render("newsPage", {
                shortNews,
                longNews,
                countLong: longNews.length,
                latestDate,
                latestTime,
                className,
                countNews: timesOfLatestNews.length,
                title: this.Model.modelName,
                datesAndTimesNews: JSON.stringify(dateAndTimeNews)
            })
        })
        .catch(() => {
            res.status(500).render("error", {error: new LoadNewsError()});
        });
}

function renderFilteredNews(req, res) {
    let Model = getModel(req.params.siteName);
    getAllNewsGroupedByDates(Model)
        .then(news => {
            let selectedNews = news[req.params.date][req.params.time];
            let shortNews = getNewsByType(selectedNews, true);

            let longNews = getNewsByType(selectedNews, false);
            console.log("Filtered: " + longNews.length);
            res.send({shortNews, longNews, countLong: longNews.length})
        })
        .catch(() => {
            res.status(500).render("error", {error: new LoadNewsError()});
        });
}

function getOneTopNew(Model){
    return getAllNewsGroupedByDates(Model)
        .then(news => {
            let dates = getDateAndTimeRanges(news);
            let maxDate = Object.keys(dates)[Object.keys(dates).length-1];
            let maxTime = Object.keys(news[maxDate])[Object.keys(news[maxDate]).length - 1];
            let newsDateTime = news[maxDate][maxTime];
            let longNews = newsDateTime.filter(item => {
                return item.shortNew === false;
            });
            return new Promise(function (resolve, reject) {
                if(longNews.length !== 0){
                    resolve({[Model.modelName] : longNews[0]})
                }
               else{
                    resolve({[Model.modelName] : []})
                }
            })
        })
}

function renderTopNews(req, res) {
    Promise.all(Object.keys(models).map(modelName => {
        return getOneTopNew(models[modelName])
    })).then(news => {
        let topNews = convertArrNewsToObj(news);
        res.render('index', {topNews});
    });
}

function searchModelNews(Model, param) {
    return Model.find({title: {$regex: '.*' + param + '.*', $options: 'i'}})
        .then(news => {
            return new Promise(function (resolve) {
                resolve({[Model.modelName]: news});
            })
        })
}

function searchAllNews(param) {
    return Promise.all(Object.keys(models).map(modelName => {
        return searchModelNews(models[modelName], param)
    }));
}

function convertArrNewsToObj(arrayNews) {
    let objNews = {};
    arrayNews.forEach(obj => {
        let siteName = Object.keys(obj)[0];
        if (obj[siteName].length !== 0) {
            objNews[siteName] = obj[siteName]
        }
    });
    return objNews;
}

function searchUniqueNews(newsS) {
    let resultSearch = {};
    for (let siteName in newsS) {
        let sortedNewsDesc = _.orderBy(newsS[siteName], ['dateParse'], ['desc']);
        let searchedNews = _.uniqBy(sortedNewsDesc, function (obj) {
            return obj.title;
        });
        resultSearch[siteName] = searchedNews
    }
    return resultSearch;
}

function renderSearchedNews(req, res) {
    searchAllNews(req.body.keywords)
        .then(result => {
            let newsObject = convertArrNewsToObj(result);
            let uniqueNews = searchUniqueNews(newsObject);
            //console.log(uniqueNews);
            res.render("searchResults", {resultNews: uniqueNews})
        })
}


router.get("/CBSS", renderLatestNews.bind({Model: models.CBSS}));

router.get("/Bleacher", renderLatestNews.bind({Model: models.Bleacher}));

router.get("/NBS", renderLatestNews.bind({Model: models.NBCS}));

router.get("/SBNation", renderLatestNews.bind({Model: models.SBNation}));

router.get("/ESPN", renderLatestNews.bind({Model: models.ESPN}));

router.get("/:siteName/:date/:time", renderFilteredNews);

router.post("/search", renderSearchedNews);

module.exports = router;
