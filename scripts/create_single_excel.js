const { readdir } = require('fs/promises');
const path = require('path');
const XLSX = require('xlsx');


function combine(excelFilename, csvFiles) {
    let workbook = XLSX.utils.book_new();
    for (const csv of csvFiles) {
        const content = XLSX.readFile(csv);
        XLSX.utils.book_append_sheet(
            workbook,
            content.Sheets[content.SheetNames[0]],
            path.parse(csv).name
        );
    }
    XLSX.writeFile(workbook, excelFilename);
}

async function findCSVs(dir) {
    try {
        const allFiles = await readdir(dir);
        return allFiles
              .filter((file) => file.endsWith('.csv'))
              .map((file) => path.join(dir, file));
    } catch (error) {
        console.error(error);
        return [];
    }
}

const [inputDir, outputFile] = process.argv.slice(2);
findCSVs(inputDir)
    .then((csvFiles) => combine(outputFile, csvFiles));

