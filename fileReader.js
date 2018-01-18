let fs = require("fs");

exports.readFile = function (path, param) {
    return JSON.parse(fs.readFileSync(path))[param];
};

exports.writeFile = function (path, data) {
    fs.writeFileSync(path, JSON.stringify({}));
    fs.writeFileSync(path, JSON.stringify(data));
};

