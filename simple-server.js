	///Check node version & basic imports///
if (Number(process.version.slice(1).split('.')[0]) < 10) throw new Error('Node 10.0.0 or higher is required. Update your Node');
const fs              = require('fs');
const bodyParser      = require('body-parser');
const path            = require('path');
const express         = require('express');
const app             = express();
const logger          = require('./modules/logger');
const port            = process.env.PORT || 3000;


	///Server middleware///
app.use('/api', express.static(path.join(__dirname, 'storage-files')));
app.use(bodyParser.json());


	///Import and init db & functions///
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./storage-files/pseudo-db.json');
const db = low(adapter);

function updateComment(in_comment) //find and update a comment based on id
{
	db.get('comments')
  	  .find({ "id": in_comment.id })
  	  .assign({
			"id": in_comment.id,
			"taskId": in_comment.taskId,
			"commentator": in_comment.commentator,
			"time": in_comment.time,
			"content": in_comment.content})
  	  .write()
}

if (process.argv[2] == '-init') //if 'node simple-server.js -init' -> init pseudo-db.json file with mock data
{
	db.defaults({comments: []}).write();
	db.get('comments').push({"id": "000", "taskId": "000", "commentator": "000", "time": "000", "content": "000"}).write();
	logger.log(`-init arg called - test data added to db`);
}


	///Server paths///
/**
	GET api/data  возвращает бинарный файл 
	POST api/data сохраняет бинарный файл 
	GET api/comments  возвращает все комментарии
	GET tasks/:taskId/comments  возвращает комментарий по id
	POST api/comments  добавляет коммент
	DELETE api/comments/id удаляет коммент по id
**/


app.listen(port);
logger.log(`Server listening at port ${port}`);