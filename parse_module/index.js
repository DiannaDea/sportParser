const needle = require("needle");
const cheerio = require("cheerio");
const fileStream = require("../fileReader");
const schedule = require('node-schedule');

const URLS = [
    "http://www.espn.com/",
    "https://www.cbssports.com/",
    "http://bleacherreport.com/",
    "https://www.sbnation.com/",
    "http://www.nbcsports.com/"];

const models = require("../models");
const NBCS = models.NBCS;
const CBSS = models.CBSS;
const ESPN = models.ESPN;
const Bleacher = models.Bleacher;
const SBNation = models.SBNation;

function parseCBSSPORTS(URL, $) {
    let news = [];
    $(".top-marquee-main .image-icon-text-overlay").each(function (item) {
        let title = $(this).children(".image-icon-title").text().trim();
        let description = $(this).children(".image-icon-dek").text().trim();
        let imageURL = $(this).prev().css("background-image").trim();
        let index = imageURL.indexOf("https");
        let imageSrc = imageURL.slice(index, -2);
        news.push({title, description, imageSrc});
    });
    $(".article-list-stack-item-title").each(function (item) {
        title = $(this).text().trim();
        imageSrc = "";
        description = "";
        news.push({title, description, imageSrc});
    });
    return news;
}

function parseBLEACHER(URL, $) {
    let news = [];
    $(".featuredArticles ol li").each(function (item) {
        let title = $(this).children(".articleContent ").text();
        let imageSrc = $(this).children(".articleMedia").find("img").attr("src");
        news.push({title, imageSrc, description: ""});
    });
    return news;
}

function parseNBC(URL, $) {
    let news = [];
    $(".top-stories .list-item .story").each(function (item) {
        let title = $(this).children(".story__title").text().trim();
        let description = $(this).children(".story__text").text().trim();
        let imageSrc = $(this).children(".story__image").find("img").attr('src');
        news.push({title, imageSrc, description});
    });
    $(".more-headlines__list li").each(function (item) {
        title = $(this).text().trim();
        news.push({title, imageSrc: "", description: ""});
    });
    return news;
}

function parseSBNation(URL, $) {
    let news = [];
    $(".c-compact-river__entry").each(function (item) {
        let title = $(this).find(".c-entry-box--compact__title").text().trim();
        let imageTag = $(this).find(".c-entry-box--compact__image noscript").text();
        let indexStart = imageTag.indexOf("https");
        let indexEnd = imageTag.indexOf("alt");
        let imageSrc = imageTag.slice(indexStart, indexEnd - 2);
        news.push({title, imageSrc, description: ""});
    });
    return news;
}

function parseESPN(URL, $) {
    let news = [];
    $(".contentCollection--hero .contentItem").each(function (item) {
        let title, description = "", imageScr = "";
        if ($(this).find(".headlineStack").length) {
            $(this).find("li").each(function (item) {
                title = $(this).find("a").text();
            })
        }
        else {
            title = $(this).find(".contentItem__title").text().trim();
            description = $(this).find(".contentItem__subhead").text().trim();
            imageSrc = $(this).find(".media-wrapper").find("img").attr("data-default-src");
        }
        news.push({title, description, imageSrc});
    })
    return news;
}

function parse(URL) {
    return new Promise(function (resolve, reject) {
        needle.get(URL, (err, res) => {
            if (err) reject(err);
            const $ = cheerio.load(res.body);
            let news;
            switch (URL) {
                case("https://www.cbssports.com/"):
                    news = parseCBSSPORTS(URL, $);
                    fillDB(news, "CBSS");
                    break;
                case("http://bleacherreport.com/"):
                    news = parseBLEACHER(URL, $);
                    fillDB(news, "BLEACHER");
                    break;
                case("http://www.nbcsports.com/"):
                    news = parseNBC(URL, $);
                    fillDB(news, "NBCS");
                    break;
                case("https://www.sbnation.com/"):
                    news = parseSBNation(URL, $);
                    fillDB(news, "SBNation");
                    break;
                case("http://www.espn.com/"):
                    news = parseESPN(URL, $);
                    fillDB(news, "ESPN");
                    break;
                default:
                    console.log("No function for parse");
                    break;
            }
            resolve(news);
        })
    })
}

function fillDB(news, siteName) {
    let Model;
    switch (siteName) {
        case("CBSS"):
            Model = CBSS;
            break;
        case("BLEACHER"):
            Model = Bleacher;
            break;
        case("NBCS"):
            Model = NBCS;
            break;
        case("SBNation"):
            Model = SBNation;
            break;
        case("ESPN"):
            Model = ESPN;
            break;
        default:
            console.log("((((((");
    }
    news.map((item, i) => {
        let newsItem;
        if (item.imageSrc === "" && item.description === "") {
            newsItem = new Model({
                title: item.title,
                shortNew: true
            });
        }
        else {
            newsItem = new Model({
                title: item.title,
                shortNew: false,
                description: item.description,
                imageSrc: item.imageSrc
            });
        }

        newsItem.save(function (err, newsItem) {
            if (err) return console.error(err);
        });
    })
}

/*
function arrayToObject(array) {
    let objResult = {};
    array.forEach(obj => {
        let siteName = Object.keys(obj)[0];
        objResult[siteName] = obj[siteName];
    });
    return objResult;
} */

function getNews() {
    return Promise.all(URLS.map(URL => {
        return parse(URL)
    }))
}

const timer = schedule.scheduleJob('*/20 * * * *', function(){
    getNews();
    console.log("GET NEWS at " + new Date());
});

module.exports = getNews;