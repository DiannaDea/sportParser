const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseFindAndFilter = require('mongoose-find-and-filter');

const schemaDB = {
    shortNew: Boolean,
    title: String,
    description: String,
    imageSrc: String,
    dateParse: {type: Number, default: Date.now}
};



const NBCSS = new Schema(schemaDB);
const CBSS = new Schema(schemaDB);
const ESPN = new Schema(schemaDB);
const Bleacher = new Schema(schemaDB);
const SBNation = new Schema(schemaDB);



NBCSS.plugin(mongooseFindAndFilter);
CBSS.plugin(mongooseFindAndFilter);
ESPN.plugin(mongooseFindAndFilter);
Bleacher.plugin(mongooseFindAndFilter);
SBNation.plugin(mongooseFindAndFilter);

module.exports = {
    NBCS: mongoose.model('NBCS', NBCSS),
    CBSS: mongoose.model('CBSS', CBSS),
    ESPN: mongoose.model('ESPN', ESPN),
    Bleacher: mongoose.model('Bleacher', Bleacher),
    SBNation: mongoose.model('SBNation', SBNation)
};
