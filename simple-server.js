	///Check node version & basic imports///
if (Number(process.version.slice(1).split('.')[0]) < 10) throw new Error('Node 10.0.0 or higher is required. Update your Node');
const fs              = require('fs');
const bodyParser      = require('body-parser');
const path            = require('path');
const express         = require('express');
const app             = express();
const logger          = require('./modules/logger');
const port            = process.env.PORT || 3000;


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
  	  .write();
}

function deleteComment(in_id) //find and delete a comment based on id
{
	db.get('comments')
  	  .remove({ "id": in_id })
  	  .write();
}

if (process.argv[2] == '-init') //if 'node simple-server.js -init' -> init pseudo-db.json file with mock data
{
	db.defaults({comments: []}).write();
	db.get('comments').push({"id": "000", "taskId": "000", "commentator": "000", "time": "000", "content": "000"}).write();
	logger.log(`-init arg called - test data added to db`);
}


	///Server paths and middleware///
/**
	POST api/data сохраняет бинарный файл 
	GET api/comments  возвращает все комментарии
	GET tasks/:taskId/comments  возвращает комментарий по id
**/

const jsonParser = bodyParser.json();
app.use(jsonParser);

app.use('/api', express.static(path.join(__dirname, 'storage-files'))); //GET api/data возвращает бинарный файл

app.post('/api/comments', (req, res) => { //POST api/comments добавляет коммент
	try
	{
		db.get('comments').push(req.body).write();
		res.status(200).end();
		logger.log(`Added ID: ${req.body.id}`);
	}
	catch
	{
		res.statusMessage = "req.body could not be read by db";
		res.status(400).end();
		logger.warn(`POST api/comments\nreq: ${req.body}`);
	}
});

app.delete('/api/comments/:id', (req, res) => { //DELETE api/comments/:id удаляет коммент по id
	try
	{
		deleteComment(req.params.id);
		res.status(200).end();
		logger.log(`Deleted ID: ${req.params.id}`);
	}
	catch
	{
		res.statusMessage = "req.params could not be read by db";
		res.status(400).end();
		logger.warn(`DELETE api/comments/:id\nreq: ${req.params}`);
	}
})


app.listen(port);
logger.ready(`Server listening at port ${port}\nEntry point: ${process.argv[1]}`);