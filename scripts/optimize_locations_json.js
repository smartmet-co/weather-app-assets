#!/usr/bin/env node
// Deduplicates `timezone` per country in locations/locations.json and writes
// locations/timezones.json. Safe to re-run: the timezone dictionary is rebuilt
// from the data each time and countries with conflicting timezones keep their
// inline value.

const fs = require('fs');
const path = require('path');

const LOCATIONS_PATH = path.join(__dirname, '../locations/locations.json');
const TIMEZONES_PATH = path.join(__dirname, '../locations/timezones.json');

const before = fs.statSync(LOCATIONS_PATH).size;
const data = JSON.parse(fs.readFileSync(LOCATIONS_PATH, 'utf8'));

const timezoneByCountry = {};
const conflicting = new Set();
for (const { country, timezone } of data) {
  if (!(country in timezoneByCountry)) {
    timezoneByCountry[country] = timezone;
  } else if (timezoneByCountry[country] !== timezone) {
    conflicting.add(country);
  }
}
for (const country of conflicting) delete timezoneByCountry[country];

const optimized = data.map(({ timezone, ...rest }) =>
  timezoneByCountry[rest.country] !== undefined ? rest : { ...rest, timezone }
);

fs.writeFileSync(LOCATIONS_PATH, JSON.stringify(optimized));
fs.writeFileSync(TIMEZONES_PATH, JSON.stringify(timezoneByCountry, null, 2) + '\n');

const after = fs.statSync(LOCATIONS_PATH).size + fs.statSync(TIMEZONES_PATH).size;
console.log(`entries: ${data.length} -> ${optimized.length}`);
console.log(`fields/entry (sample): ${Object.keys(data[0]).length} -> ${Object.keys(optimized[0]).length}`);
console.log(`bytes: ${before} -> ${after} (${((1 - after / before) * 100).toFixed(1)}% smaller)`);
console.log(`timezones: ${JSON.stringify(timezoneByCountry)}`);
if (conflicting.size) {
  console.warn('countries kept inline timezone (conflicting values):', [...conflicting]);
}
