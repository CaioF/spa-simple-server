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
const { json } = require('body-parser');
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
	let values = db.get('comments').value();
	let out_comments = [];
	values.forEach( (i) => {
		if (i.taskId == in_taskId)
		out_comments.push(i);
	});
	return out_comments;
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
	let new_file = fs.createWriteStream('./storage-files/data');
	req.pipe(new_file);
	new_file.on('finish', () => {
	  new_file.close( () => {
		res.status(200).end();
		logger.log('Rewrote data file');
	  });
	}).on('error', (err) => {
		res.status(400).end();
		logger.error(`Failed to POST api/data`);
		fs.unlink('./storage-files/data'); // Delete the file async ob err.
  });
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
		logger.error(`Failed GET api/comments`);
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
		logger.error(`Failed POST api/comments`);
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
		logger.error(`Failed DELETE api/comments/:id`);
	}
});

app.get('/tasks/:taskId/comments', (req, res) => {//GET tasks/:taskId/comments возврашает коментарий по taskId
	if (req.header('Content-Type') != 'application/json') logger.warn('GET tasks/:taskId/comments request header must be application/json');
	res.setHeader('Content-Type', 'application/json');
	try
	{
		res.send(getComments(req.params.taskId));
	}
	catch
	{
		res.status(400).end();
		logger.error(`Failed GET tasks/:taskId/comments`);
	}
});


app.listen(port);
logger.ready(`Server listening at port ${port}\nEntry point: ${process.argv[1]}`);