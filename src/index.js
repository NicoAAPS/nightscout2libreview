const dayjs = require('dayjs');
const uuid = require('uuid');
const colors = require('colors');
const prompt = require('prompt');
const fs = require('fs');
require('dotenv').config({ path: __dirname + '/../config.env' });

const libre = require('./functions/libre');
const nightscout = require('./functions/nightscout');

const CONFIG_NAME = './config.json';
const DEFAULT_CONFIG = {
};

if (!fs.existsSync(CONFIG_NAME)) {
  fs.writeFileSync(CONFIG_NAME, JSON.stringify(DEFAULT_CONFIG));
}

const rawConfig = fs.readFileSync(CONFIG_NAME);
let config = JSON.parse(rawConfig);
console.log(config);

/**/
// print process.argv - command line arguments
//process.argv.forEach(function (val, index, array) {
//  console.log(index + ': ' + val);
//});
// I do not do connand line arguments (yet)

if (config.deltaDay > 0) {
  var deltaday = Number(config.deltaDay); }
else {
  var deltaday = 1; }
//console.log("deltaday" + deltaday);
var d = new Date();
//d.setDate(d.getDate() - deltaday);

if (config.fromYear > 0) {
    fromyear = config.fromYear; }
else {
  fromyear = d.getFullYear(); }

if (config.fromMonth > 0) {
    frommonth = config.fromMonth; }
else {
    frommonth = d.getMonth(); }  //month starts from 0

if (config.fromDay > 0) {
  fromday = config.fromDay; }
else {
  fromday = d.getDate(); }	

//console.log("from date: " + fromday + "/" + frommonth + "/" + fromyear);

var tod = new Date();
tod.setFullYear(fromyear);
tod.setMonth(frommonth);
tod.setDate(Number(fromday) + deltaday);
//tod.setDate(tod.getDate() + deltaday);
toyear = tod.getFullYear();
tomonth = tod.getMonth(); //month starts from 0
today = tod.getDate();	

//console.log("to date:" + tod);
//console.log("To date: " + today + "/" + tomonth + "/" + toyear);
const fromDate = dayjs(`${fromyear}-${frommonth}-${fromday}`).format('YYYY-MM-DD');
const toDate = dayjs(`${toyear}-${tomonth}-${today}`).format('YYYY-MM-DD');
console.log("Upload datad from " + fromDate +  " to " + toDate);
/**/

  (async () => {
    
    console.log('transfer time span', fromDate.gray, toDate.white);

    const glucoseEntries = await nightscout.getNightscoutGlucoseEntries(config.nightscoutUrl, config.nightscoutToken, fromDate, toDate);
    const foodEntries = await nightscout.getNightscoutFoodEntries(config.nightscoutUrl, config.nightscoutToken, fromDate, toDate);
    const insulinEntries = await nightscout.getNightscoutInsulinEntries(config.nightscoutUrl, config.nightscoutToken, fromDate, toDate);

    if (glucoseEntries.length > 0 || foodEntries.length > 0 || insulinEntries.length > 0) {
      const auth = await libre.authLibreView(config.libreUsername, config.librePassword, config.libreDevice, (config.libreResetDevice === "true"));
      if (!!!auth) {
        console.log('libre auth failed!'.red);

        return;
      }

      await libre.transferLibreView(config.libreDevice, auth, glucoseEntries, foodEntries, insulinEntries);
    }
  })();
/*});*/

function onErr(err) {
  console.log(err);
  return 1;
}
