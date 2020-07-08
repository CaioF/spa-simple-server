	///Check node version & basic imports///
const fs              = require('fs');
const bodyParser      = require('body-parser');
const path            = require('path');
const express         = require('express');
const app             = express();
const logger          = require('./modules/logger');
const port            = process.env.PORT || 3000;

if (Number(process.version.slice(1).split('.')[0]) < 10) logger.error('Node 10.0.0 or higher is required. Update your Node');


	///Import and init db & functions///
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./storage-files/pseudo-db.json');
const db = low(adapter);

function updateComment(in_comment)//find and update a comment based on id
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

function deleteComment(in_id)//find and delete a comment based on id
{
	db.get('comments')
  	  .remove({ "id": in_id })
  	  .write();
}

function getComments(in_taskId)//find return a collection of comments based on id
{
	
}

if (process.argv[2] == '-init')//if 'node simple-server.js -init' -> init pseudo-db.json file with mock data
{
	db.defaults({comments: []}).write();
	db.get('comments').push({"id": "0", "taskId": "0", "commentator": "0", "time": "0", "content": "0"}).write();
	logger.cmd(`'-init' arg called, test data added to pseudo-db.json`);
}


	///Server paths and middleware///
const jsonParser = bodyParser.json();
app.use(jsonParser);

app.use('/api', express.static(path.join(__dirname, 'storage-files')));//GET api/data возвращает бинарный файл

app.post('/api/data', (req, res) => {//POST api/data сохраняет бинарный файл 

});

app.get('/api/comments', (req, res) => {//GET api/comments возвращает все комментарии 
	res.setHeader('Content-Type', 'application/json');
	try
	{
		res.send(db.get('comments').value());
	}
	catch
	{
		res.status(400).end();
		logger.error(`Failed GET api/comments\nres: ${res}`);
	}
});

app.post('/api/comments', (req, res) => {//POST api/comments добавляет один коммент
	if (req.header('Content-Type') != 'application/json') logger.warn('POST api/comments request header must be application/json');
	try
	{
		db.get('comments').push(req.body).write();
		res.status(200).end();
		logger.log(`Added ID: ${req.body.id}`);
	}
	catch
	{
		res.status(400).end();
		logger.error(`Failed POST api/comments\nreq: ${req.body}`);
	}
});

app.delete('/api/comments/:id', (req, res) => {//DELETE api/comments/:id удаляет коммент по id
	if (req.header('Content-Type') != 'application/json') logger.warn('DELETE api/comments/:id request header must be application/json');
	try
	{
		deleteComment(req.params.id);
		res.status(200).end();
		logger.log(`Deleted ID: ${req.params.id}`);
	}
	catch
	{
		res.status(400).end();
		logger.error(`Failed DELETE api/comments/:id\nreq: ${req.params}`);
	}
});

app.get('tasks/:taskId/comments', (req, res) => {//GET tasks/:taskId/comments возврашает коментарий по taskId
	if (req.header('Content-Type') != 'application/json') logger.warn('GET tasks/:taskId/comments request header must be application/json');
	res.setHeader('Content-Type', 'application/json');
	try
	{

	}
	catch
	{

	}
});


app.listen(port);
logger.ready(`Server listening at port ${port}\nEntry point: ${process.argv[1]}`);