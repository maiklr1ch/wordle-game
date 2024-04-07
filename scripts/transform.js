const fs = require("fs");

const hrstart = process.hrtime();

const array = [];
fs.readFileSync("./scripts/data/wordle-eng.txt", {encoding: "utf-8"})
    .split(/\r?\n/)
    .forEach((line) => {
        array.push(line);
    });

fs.writeFileSync("./src/data/wordle-eng.json", JSON.stringify(array));

const hrend = process.hrtime(hrstart);

console.info(`Execution time is: ${hrend[0]}s ${hrend[1] / 1000000}ms`);