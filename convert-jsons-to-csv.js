const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

const dataDir = './timetable/data'; // Your directory with JSON files
let allData = [];

fs.readdirSync(dataDir).forEach(file => {
    if (path.extname(file) === '.json') {
        const user = path.basename(file, '.json');
        const jsonData = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));

        Object.entries(jsonData).forEach(([day, periods]) => {
            Object.entries(periods).forEach(([period, details]) => {
                allData.push({ user, day, period, ...details });
            });
        });
    }
});

const csv = parse(allData);
fs.writeFileSync('timetables.csv', csv);
console.log('Data saved to timetables.csv');