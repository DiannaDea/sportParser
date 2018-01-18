function ParseError() {
    this.name = 'ParseError';
    this.message = "Unable to parse site";
    this.stack = (new Error()).stack;
}
ParseError.prototype = Object.create(Error.prototype);
ParseError.prototype.constructor = ParseError;

function LoadNewsError(){
    this.name = 'LoadNews';
    this.message = "Unable to load news";
    this.stack = (new Error()).stack;
}

function NoFunctionForParseError(){
    this.name = 'NoFunctionForParse';
    this.message = "No function for parse in parse functions list";
    this.stack = (new Error()).stack;
}

module.exports.ParseError = ParseError;
module.exports.LoadNewsError = LoadNewsError;
module.exports.NoFunctionForParseError = NoFunctionForParseError;