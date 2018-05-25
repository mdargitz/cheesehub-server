
const cheeses = require('./db/cheeses');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');


const { PORT, CLIENT_ORIGIN } = require('./config');
// const { dbConnect } = require('./db-mongoose');
const {dbConnect, dbGet} = require('./db-knex');

const app = express();

app.use(express.json());

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.get('/api/cheeses', (req,res,next)=>{
  dbGet()
    .from('cheeses')
    .select()
    .then(result => res.json(result));
});

app.post('/api/cheeses', (req, res, next)=>{
  const cheese = req.body.name;
  console.log(cheese);

  if (typeof cheese !== 'string'){
    const err = new Error('The new cheese must be a string');
    err.status = 400;
    return next(err);
  }
  if (cheese === 'errortime'){
    console.log('made it to errortime');
    const err = new Error('You made an error! Horray!');
    err.status = 500;
    return next(err);
  }
  console.log('made it out of the error handler');
  dbGet()
    .from('cheeses')
    .insert({'name' : cheese}, ['id', 'name'])
    .then(results => res.json(results));
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: 'development'
  });
});


function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}



if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
