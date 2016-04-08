#!/usr/bin/env node

"use strict";

const data = require('caniuse-db/data.json');
const clc = require('cli-color');
const os = require('os');
const browserslist = require('browserslist');
const table = require('text-table');

const argv = require('yargs')
  .usage('$0 [args] <browser> [browser]')
  .option('ascii', {
    alias: 'A',
    type: 'boolean',
    default: false,
    describe: "UTF-8 symbols replacement with ASCII description"
  })
  .help('help')
  .argv

let resultmap = {
  "y": "✔",
  "a": "◒",
  "n": "✘",
  "p": "✘ ᵖ",
  "u": "‽",
  "x": "⁻",
  "d": "⚑",
  "i": "ⓘ",
  "w": "⚠",
  "s": "⁰¹²³⁴⁵⁶⁷⁸⁹"};
if(os.platform() == 'win32'){
  resultmap = {
    "y": "\u221A",
    "a": "\u0473",
    "n": "\u00D7",
    "p": "\u00D7 \u1D56",
    "u": "\u203D",
    "x": "\u207B",
    "d": "\u2691",
    "i": "\u24D8",
    "w": "\u26A0",
    "s": "\u2070\u00B9\u00B2\u00B3\u2074\u2075\u2076\u2077\u2078\u2079"};
}
if(argv["ascii"]){
  resultmap = {
    "y": "Yes",
    "a": "Partly",
    "n": "No",
    "p": "No ᵖ",
    "u": "?!",
    "x": "⁻",
    "d": "⚑",
    "i": "Info",
    "w": "Warning",
    "s": "⁰¹²³⁴⁵⁶⁷⁸⁹"};
}

if((Date.now()/1000 - data.updated) > 30*60*60*24) {
  console.warn(clc.yellow(`${resultmap.w}  
    Caniuse data is more than 30 days out of date!
    Consider updating: npm install caniuse-cmd`));
}

const getBrowser = (version) => {
  try {
    if(browserslist(version)) {
      return browserslist(version)[0];
    } else {
      console.error(clc.red(`${resultmap.n} Unknown browser ${browsers[0]}`));
      return false;
    }
  } catch(e) {
    console.error(clc.red(`${resultmap.n} ${e.message}`));
    return false;
  }
}


const browsers = argv._;
if(browsers.length < 1) {
  console.error(clc.red(`need at least 1 argument to compare`));
  return;
}
const browsersFirst = getBrowser(browsers[0]);
if(!browsersFirst) {
  return;
}

// compare to last version when only 1 args
let browserTwoArgs = '';
if(browsers.length === 1) {
  let b = browsersFirst.split(' ')[0];
  browserTwoArgs = `last 1 ${b} versions`;
} else {
  browserTwoArgs = browsers[1];
}
const browsersTwo = getBrowser(browserTwoArgs);
if(!browsersTwo) {
  return;
}

const renderStat = (stat) => {
  let statArray = stat.split(' ');
  let support = statArray[0];
  let out = statArray.map((item) => {
    if(item.startsWith('#')){
      return item.substr(1).split('').map(function(num) {
        return resultmap.s.charAt(num);
      }).join(' ');
    };
    return resultmap[item] || item;
  }).join(' ');
  switch(support) {
    case 'y':
      return clc.green(out);
    case 'n':
      return clc.red(out);
    case 'p':
      return clc.red(out);
    case 'a':
      return clc.yellow(out);
  }
  return out;
}

let result = [];
for(let key in data.data) {
  const useData = data.data[key];
  const stats = useData.stats;
  const browsersFirstArray = browsersFirst.split(' ');
  const browsersTwoArray = browsersTwo.split(' ');
  const browsersFirstStat = stats[browsersFirstArray[0]][browsersFirstArray[1]];
  const browsersTwoStat = stats[browsersTwoArray[0]][browsersTwoArray[1]];
  if(browsersFirstStat != browsersTwoStat) {
    result.push([
      useData.title.length > 40 ? key : useData.title,
      renderStat(browsersFirstStat),
      renderStat(browsersTwoStat)
    ]);
  }
}

if(result.length == 0) {
  console.log(clc.green('Congratulations, No Diff'));
  return;
}

// add table header
result.unshift([
  'features',
  browsersFirst,
  browsersTwo
]);

console.log(
  table(result, {
    align: [ 'l', 'c', 'c' ],
    stringLength: function(s) { return clc.getStrippedLength(s) }
  })
);