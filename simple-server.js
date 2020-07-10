///Check node version & basic imports///
const fs = require('fs');
const bodyParser = require('body-parser');
const cors       = require('cors');
const path       = require('path');
const express    = require('express');
const app        = express();
const logger     = require('./logger');
const port       = process.env.PORT || 3000;

if (Number(process.version.slice(1).split('.')[0]) < 10) logger.error('Node 10.0.0 or higher is required. Update your Node');

///Check for or create files///
if (process.argv[2] == '-init')//if 'node simple-server.js -init' -> init pseudo-db.json file with mock data
{	
    logger.cmd('\'-init\' arg called, checking for/creating files for storage');
    try {
        let comments_stream = fs.createWriteStream('./storage/pseudo-db.json', {flags:'a'}); comments_stream.end();
        let users_stream = fs.createWriteStream('./storage/users.json', {flags:'a'}); users_stream.end();
        let data_stream = fs.createWriteStream('./storage/data', {flags:'a'}); data_stream.end();
    } catch(err) {logger.error(err)};
}


///Import and init db & functions///
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('./storage/pseudo-db.json');
const db = low(adapter);

function deleteComment(in_id)//find and delete a comment based on id
{
    db.get('comments')
        .remove({ 'id': in_id })
        .write();
}

function getComments(in_taskId)//find return a collection of comments based on id
{
    let values = db.get('comments').value();
    let out_comments = [];
    values.forEach((i) => {
        if (i.taskId == in_taskId)
            out_comments.push(i);
    });
    return out_comments;
}

/** 
function updateComment(in_comment)//find and update a comment based on id
{
    db.get('comments')
        .find({ 'id': in_comment.id })
        .assign({
            'id': in_comment.id,
            'taskId': in_comment.taskId,
            'commentator': in_comment.commentator,
            'time': in_comment.time,
            'content': in_comment.content})
        .write();
}
**/

///Server paths and middleware///
const jsonParser = bodyParser.json();
app.use(jsonParser);
app.use(cors());

app.use('/api', express.static(path.join(__dirname, 'storage')));//GET api/data возвращает бинарный файл

app.post('/api/data', (req, res) => {//POST /api/data сохраняет бинарный файл 
    let new_file = fs.createWriteStream('./storage/data');
    req.pipe(new_file);
    new_file.on('finish', () => {
        new_file.close(() => {
            res.status(200).end();
            logger.log('Rewrote data file');
        });
    }).on('error', (err) => {
        res.status(400).end();
        logger.error(`Failed to POST /api/data\n${err}`);
        fs.unlink('./storage/data'); // Delete the file async on err.
    });
});

app.get('/api/comments', (req, res) => {//GET /api/comments возвращает все комментарии 
    res.setHeader('Content-Type', 'application/json');
    try {
        res.send(db.get('comments').value());
    }
    catch (err) {
        res.status(400).end();
        logger.error(`Failed GET /api/comments\n${err}`);
    }
});

app.post('/api/comments', (req, res) => {//POST /api/comments добавляет один коммент
    if (req.header('Content-Type') != 'application/json') logger.warn('POST api/comments request header must be application/json');
    try {
        db.get('comments').push(req.body).write();
        res.status(200).end();
        logger.log(`Added ID: ${req.body.id}`);
    }
    catch (err) {
        res.status(400).end();
        logger.error(`Failed POST /api/comments\n${err}`);
    }
});

app.delete('/api/comments/:id', (req, res) => {//DELETE /api/comments/:id удаляет коммент по id
    if (req.header('Content-Type') != 'application/json') logger.warn('DELETE api/comments/:id request header must be application/json');
    try {
        deleteComment(req.params.id);
        res.status(200).end();
        logger.log(`Deleted ID: ${req.params.id}`);
    }
    catch (err) {
        res.status(400).end();
        logger.error(`Failed DELETE /api/comments/:id\n${err}`);
    }
});

app.get('/api/tasks/:taskId/comments', (req, res) => {//GET /tasks/:taskId/comments возврашает коментарий по taskId
    if (req.header('Content-Type') != 'application/json') logger.warn('GET tasks/:taskId/comments request header must be application/json');
    res.setHeader('Content-Type', 'application/json');
    try {
        res.send(getComments(req.params.taskId));
    }
    catch (err) {
        res.status(400).end();
        logger.error(`Failed GET /tasks/:taskId/comments\n${err}`);
    }
});

app.get('/user.json', (req, res) => {//GET /user.json?username=*** возврашает пользователя по username
    res.setHeader('Content-Type', 'application/json');
    try {
        let users = require('./storage/users.json').users;
        let username = req.query.username;
        if (username) {
            const users = users.filter(u => u.username === username);
        }
        res.send(users[0]);
    }
    catch (err) {
        res.status(400).end();
        logger.error(`Failed GET /user.json?username=***\n${err}`);
    }

});

app.listen(port);
logger.ready(`Server listening at port ${port}\nEntry point: ${process.argv[1]}`);