'use strict';

var couchbase = require('couchbase');
var express = require('express');
var uuid = require('uuid');
var dateFormat = require('dateformat');
var cors = require('cors')

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
app.use(express.json());
app.use(express.static('public'));
app.use(cors())


app.get('/api/application', async (req, res) => {
  const email = req.query.email;

  let qs;
  let result;

  qs = `SELECT meta(default).id,default.* from \`default\` WHERE email = '${email.toLocaleLowerCase()}'`;
  qs += ";";

  console.log(qs)

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

  console.log(payload)

  let key = `application:${uuid.v4()}`
  let date = dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");
  let document = {
    "city": payload.city,
    "collegeGrade": payload.collegeGrade,
    "dateOfBirth": payload.dateOfBirth,
    "degreeStatus": payload.degreeStatus,
    "email": payload.email,
    "firstDegree": payload.firstDegree,
    "firstName": payload.firstName,
    "hsStatus": payload.hsStatus,
    "isCitizen": payload.isCitizen,
    "lastName": payload.lastName,
    "middleInitial": payload.middleInitial,
    "phoneNumber": payload.phoneNumber,
    "residentDate": payload.residentDate,
    "ssn": payload.ssn,
    "state": payload.state,
    "street": payload.street,
    "workStudy": payload.workStudy,
    "zipcode": payload.zipcode,

    // everything above here is from user payload
    "username": payload.username,
    "status": "SUBMITTED",
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
