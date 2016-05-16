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
  .option('major', {
    alias: 'M',
    type: 'boolean',
    default: false,
    describe: "major diff only"
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

const getBrowser = (selection) => {
  try {
    if(browserslist(selection)) {
      const b = browserslist(selection)[0];
      const bList = b.split(' ');
      return {
        browser: bList[0],
        version: bList[1]
      };
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
const browserLeft = getBrowser(browsers[0]);
if(!browserLeft) {
  return;
}

// compare to last version when only 1 args
let rightSelection = '';
if(browsers.length === 1) {
  let b = browserLeft.browser;
  rightSelection = `last 1 ${b} versions`;
} else {
  rightSelection = browsers[1];
}
const browserRight = getBrowser(rightSelection);
if(!browserRight) {
  return;
}

const resolveStat = (stat) => {
  let statArray = stat.split(' ');
  let support = statArray.shift();
  return {
    support,
    extra: statArray
  }
}

let result = [];
for(let key in data.data) {
  const useData = data.data[key];
  const stats = useData.stats;
  const leftStat = stats[browserLeft.browser][browserLeft.version];
  const rightStat = stats[browserRight.browser][browserRight.version];
  if(leftStat != rightStat) {
    result.push({
      key,
      title: useData.title,
      left: resolveStat(leftStat),
      right: resolveStat(rightStat)
    });
  }
}

if (argv["major"]) {
  result = result.filter(item => {
    return item.left.support !== item.right.support;
  })
}

if(result.length == 0) {
  console.log(clc.green('Congratulations, No Diff'));
  return;
}

let displayTable = [];
// add table header
displayTable.push([
  'features',
  `${browserLeft.browser} ${browserLeft.version}`,
  `${browserRight.browser} ${browserRight.version}`
]);

const renderStat = (stat) => {
  let out = `${resultmap[stat.support]} `;
  out += stat.extra.map((item) => {
    if(item.startsWith('#')){
      return item.substr(1).split('').map(function(num) {
        return resultmap.s.charAt(num);
      }).join(' ');
    };
    return resultmap[item] || item;
  }).join(' ');
  switch(stat.support) {
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

result.forEach(item => {
  displayTable.push([
    item.title.length > 40 ? item.key : item.title,
    renderStat(item.left),
    renderStat(item.right)
  ])
})

console.log(
  table(displayTable, {
    align: [ 'l', 'c', 'c' ],
    stringLength: function(s) { return clc.getStrippedLength(s) }
  })
);