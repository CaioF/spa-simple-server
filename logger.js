/*
Logger class for easy and aesthetically pleasing console logging 
*/
const chalk           = require('chalk');
const moment          = require('moment');
const fs              = require('fs');

exports.log = (content, type = 'log') => {
	const stream = fs.createWriteStream('./storage/local.log', {flags:'a'});
	const timestamp = `[${moment().format('YYYY-MM-DD HH:mm:ss')}]:`;
	switch (type) {
	case 'log': {
		let logged = `${timestamp} ${content} `;
		stream.write(logged + '\n');
		stream.end();
		return console.log(chalk.bgBlue(type.toUpperCase()), logged);
	}
	case 'warn': {
		let logged = `${timestamp} ${content} `;
		stream.write(logged + '\n');
		stream.end();
		return console.log(chalk.black.bgYellow(type.toUpperCase()), logged);
	}
	case 'error': {
		let logged = `${timestamp} ${content} `;
		stream.write(logged + '\n');
		stream.end();
		return console.log(chalk.bgRed(type.toUpperCase()), logged);
	}
	case 'debug': {
		let logged = `${timestamp} ${content} `;
		stream.write(logged + '\n');
		stream.end();
		return console.log(chalk.green(type.toUpperCase()), logged);
	}
	case 'cmd': {
		let logged = `${timestamp} ${content} `;
		stream.write(logged + '\n');
		stream.end();
		return console.log(chalk.black.bgWhite(type.toUpperCase()), logged);
	}
	case 'ready': {
		let logged = `${timestamp} ${content} `;
		stream.write(logged + '\n');
		stream.end();
		return console.log(chalk.black.bgGreen(type.toUpperCase()), logged);
	}
	default: throw new TypeError('Logger type must be either warn, debug, log, ready, cmd or error.');
	}
}; 

exports.error = (...args) => this.log(...args, 'error');

exports.warn = (...args) => this.log(...args, 'warn');

exports.debug = (...args) => this.log(...args, 'debug');

exports.cmd = (...args) => this.log(...args, 'cmd');

exports.ready = (...args) => this.log(...args, 'ready');