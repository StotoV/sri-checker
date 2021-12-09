#! /usr/bin/env node
const { ArgumentParser } = require('argparse')

const SRI = require('./src/index.js')
const { version } = require('./package.json')

const parser = new ArgumentParser()

parser.add_argument('url', { type: 'str',  help: 'The URL to check the SRI for' })
parser.add_argument('-o', '--output', { type: 'str', required: true,  help: 'The path to the output directory, will be created if non-existent' })
parser.add_argument('-v', '--version', { help: 'Print the version', action: 'version', version })

const args = parser.parse_args()

const res = SRI.checkURL(args.url, args.output)
