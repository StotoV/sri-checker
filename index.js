#! /usr/bin/env node
const { ArgumentParser } = require('argparse')
const fs = require('fs');

const SRI = require('./src/index.js')
const { version } = require('./package.json')

const parser = new ArgumentParser()

parser.add_argument('-v', '--version', { help: 'Print the version', action: 'version', version })

subparsers = parser.add_subparsers()

single = subparsers.add_parser('single')
single.add_argument('url', { type: 'str',  help: 'The URL to check the SRI for' })
single.add_argument('-o', '--output', { type: 'str', required: true,  help: 'The path to the output directory, will be created if non-existent' })

list = subparsers.add_parser('list')
list.add_argument('-i', '--input', { type: 'str', required: true, help: 'The path to the input file containing URLs' })
list.add_argument('-o', '--output', { type: 'str', required: true,  help: 'The path to the output directory, will be created if non-existent' })

const args = parser.parse_args()

if (args.url) {
    SRI.checkURL([args.url], args.output)
} else if (args.input) {
    var targets = fs.readFileSync(args.input).toString('utf-8')
    targets = targets.split("\n")
    targets.pop()
    SRI.checkURL(targets, args.output)
}
