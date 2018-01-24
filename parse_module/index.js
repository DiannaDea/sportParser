const needle = require("needle");
const cheerio = require("cheerio");
const ParseError = require("../customErrors");
const NoFunctionForParseError = require("../customErrors");

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
        let link = "https://www.cbssports.com" + $(this).parent().parent().attr("href");
        news.push({title, description, imageSrc, link});
    });
    $(".article-list-stack-item-title").each(function (item) {
        let link = "https://www.cbssports.com" + $(this).parent().attr("href");

        title = $(this).text().trim();
        imageSrc = "";
        description = "";
        news.push({title, description, imageSrc, link});
    });
    return news;
}

function parseBLEACHER(URL, $) {
    let news = [];
    $(".featuredArticles ol li").each(function (item) {
        let title = $(this).children(".articleContent ").text();
        let link = $(this).find(".articleContent a").attr("href");
        let imageSrc = $(this).children(".articleMedia").find("img").attr("src");
        if(imageSrc !== undefined){
            imageSrc = getBiggerImage(imageSrc);
            news.push({title, imageSrc, description: "", link});
        }
        else{
            news.push({title, imageSrc: "", description: "", link});
        }
    });
    $(".headlinesArticles li").each(function (item) {
        let title = $(this).children(".articleContent").text();
        let link = $(this).children(".articleContent").find("a").attr("href");
        news.push({title, imageSrc: "", description: "", link});
    });
    return news;
}

function getBiggerImage(imageSrc) {
    let srcArr = imageSrc.split("?");

    let srcEnd = srcArr[1];
    let srcEndArr = srcEnd.split("&");

    let width = srcEndArr[0].split("=");
    let widCur = width[1] + "0";
    width[1] = widCur;

    let height = srcEndArr[1].split("=");
    let heiCur = height[1] + "0";
    height[1] = heiCur;


    srcEndArr[0] = width.join("=");
    srcEndArr[1] = height.join("=");

    srcEnd = srcEndArr.join("&");
    return srcArr[0] + "?" + srcEnd;
}

function parseNBC(URL, $) {
    let news = [];
    $(".top-stories .list-item .story").each(function (item) {
        let title = $(this).children(".story__title").text().trim();
        let link = $(this).children(".story__title").find("a").attr("href");
        let description = $(this).children(".story__text").text().trim();
        let imageSrc = $(this).children(".story__image").find("img").attr('src');
        news.push({title, imageSrc, description, link});
    });
    $(".more-headlines__list li").each(function (item) {
        let link =$(this).children("a").attr("href");
        title = $(this).text().trim();
        news.push({title, imageSrc: "", description: "", link});
    });
    return news;
}

function parseSBNation(URL, $) {
    let news = [];
    $(".c-compact-river__entry").each(function (item) {
        let title = $(this).find(".c-entry-box--compact__title").text().trim();
        let link = $(this).find(".c-entry-box--compact__title a").attr("href");
        let imageTag = $(this).find(".c-entry-box--compact__image noscript").text();
        let indexStart = imageTag.indexOf("https");
        let indexEnd = imageTag.indexOf("alt");
        let imageSrc = imageTag.slice(indexStart, indexEnd - 2);
        news.push({title, imageSrc, description: "", link });
    });
    return news;
}

function parseESPN(URL, $) {
    let news = [];
    $(".contentCollection--hero .contentItem").each(function (item) {
        let link, title, imageSrc, description;
        if($(this).children("a").attr("href") !== undefined){
            link = "http://www.espn.com" + $(this).children("a").attr("href");
        }
        else if($(this).find(".contentItem__contnent a").attr("href") !== undefined){
            link = "http://www.espn.com" + $(this).find("section a").attr("href");
        }
        else if($(this).find("header a").attr("href") !== undefined){
            link = "http://www.espn.com" + $(this).find("header a").attr("href");
        }
        else{
            return;
        }

        title = $(this).find(".contentItem__title").text().trim();
        description = $(this).find(".contentItem__subhead").text().trim();
        imageSrc = $(this).find(".media-wrapper").find("img").attr("data-default-src")
        news.push({title, description, imageSrc, link});
    });
    $(".headlineStack__listContainer .headlineStack__list li").each(function(item){
        let title = $(this).text().trim();
        let link = "http://www.espn.com" + $(this).find("a").attr("href");
        news.push({title, description: "", imageSrc : "", link})
    });
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
                    reject(new NoFunctionForParseError())
            }
            resolve(news);
        })
    })
}

function getModel(siteName) {
    switch (siteName) {
        case("CBSS"):
            return CBSS;
        case("BLEACHER"):
            return Bleacher;
        case("NBCS"):
            return NBCS;
        case("SBNation"):
            return SBNation;
        case("ESPN"):
            return ESPN;
    }
}

function fillDB(news, siteName) {
    let Model = getModel(siteName);
    news.map((item, i) => {
        let newsItem;
        if (item.imageSrc === "" && item.description === "") {
            newsItem = new Model({
                title: item.title,
                shortNew: true,
                link: item.link
            });
        }
        else {
            newsItem = new Model({
                title: item.title,
                link: item.link,
                shortNew: false,
                description: item.description,
                imageSrc: item.imageSrc,

            });
        }
        newsItem.save(function (err, newsItem) {
            if (err) console.log(err);
        });
    })
}


function getNews() {
    return Promise.all(URLS.map(URL => {
        return parse(URL)
    }))
        .then(() => {
            console.log("GET NEWS at " + new Date());
        })
        .catch(error => {
            throw new ParseError();
        });
}

module.exports = getNews;

