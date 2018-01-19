function CustomError(name, message) {
    Error.call(this);
    this.name = name;
    this.message = message;
    this.stack = (new Error()).stack;
}


let ParseError = new CustomError("ParseError", "Unable to parse site");
let LoadNewsError = new CustomError('LoadNews', "Unable to load news");
let NoFunctionForParseError = new CustomError("NoFunctionForParse", "No function for parse in parse functions list");
let NoNewsRecentlyError = new CustomError("NoNewsRecently", "No news parsed for the last 20 min");

module.exports = {ParseError, LoadNewsError, NoNewsRecentlyError, NoFunctionForParseError};

