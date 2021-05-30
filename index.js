'use strict';

var bodyParser = require('body-parser');
var couchbase = require('couchbase');
var express = require('express');
var uuid = require('uuid');
var dateFormat = require('dateformat');

// Create a Couchbase Cluster connection
var cluster = new couchbase.Cluster(
  'couchbase://localhost',
  {
    username: 'admin',
    password: 'password'
  }
);

var bucket = cluster.bucket('default');
var coll = bucket.defaultCollection();

// Set up our express application
var app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/api/applications', async (req, res) => {
  const status = req.query.status;

  let qs;
  let result;

  qs = `SELECT meta(default).id,default.* from \`default\``;
  if (status) {
    qs += ` WHERE status = '${status.toUpperCase()}'`;
  }
  qs += ";";


  try {
    result = await cluster.query(qs)
    console.log("Result: ", result)
  } catch (error) {
    console.error('Query failed: ', error)
  }
  
  res.send(result.rows);
});

app.post('/api/applications', async (req, res) => {
  let payload = req.body
  let result;

  let key = `application:${uuid.v4()}`
  let date = dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");
  let document = {
    "name": payload.name,
    "school": payload.school,
    "ssn": payload.ssn,
    "status": "PENDING",
    "updated": date,
    "submitted": date
  }

  try {
    result = await coll.insert(key, document);
    console.log("Result: ", result)
  } catch(error) {
    console.error('Insert failed: ', error)
  }

  res.send({
    "result": `${key} successfully submitted.`
  })
});

app.listen(8080, () => {
  console.log('Backend listening on port 8080!');
});
