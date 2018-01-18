const express = require('express');
const router = express.Router();
const LoadNewsError = require("../customErrors").LoadNewsError;
const NoNewsRecentlyError = require("../customErrors").NoNewsRecentlyError;

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

function renderNews(req, res) {
    getLatestNews(this.Model)
        .then(news => {
            let shortNews = getNewsByType(news, true);
            let longNews = getNewsByType(news, false);
            res.render("newsPage", {shortNews: shortNews, longNews: longNews, title: this.Model.modelName})
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


router.get("/CBSS", renderNews.bind({Model: models.CBSS}));

router.get("/Bleacher", renderNews.bind({Model: models.Bleacher}));

router.get("/NBS", renderNews.bind({Model: models.NBCS}));

router.get("/SBNation", renderNews.bind({Model: models.SBNation}));

router.get("/ESPN", renderNews.bind({Model: models.ESPN}));


module.exports = router;
