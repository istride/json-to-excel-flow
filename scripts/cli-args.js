const yargs = require('yargs');

const argv = yargs
    .option('input-path', {
        alias: 'i',
        description: 'Input path',
    })
    .option('output-path', {
        alias: 'o',
        description: 'Output path',
    })
    .demandOption(
        ['input-path', 'output-path'],
        'Must specify an input and output path'
    )
    .option('flow-cat', {
        description: '???'
    })
    .help()
    .alias('help', 'h')
    .argv;

const inputPath = argv.i;
const outputPath = argv.o;
console.log(`Reading from '${inputPath}'`);
console.log(`Writing to '${outputPath}'`);

if (argv.flowCat) {
    console.log(`Something something flow cat '${argv.flowCat}'`)
}
