if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}

var express = require('express');
var app = express();
var azure = require('azure');
var port = process.env.PORT || 3000;

var serviceBusService = azure.createServiceBusService();
serviceBusService.createQueueIfNotExists('myqueue', function(error){
  if(!error){
    console.log('Service Bus Created');
  } else {
    console.log(error);
  }
});

serviceBusService.createTopicIfNotExists('mytopic',function(error){
  if(!error){
    // Topic was created or exists
    console.log('topic created or exists.');
  }
});

app.get('/create_message', function(req, res, next) {
  var message = {
    body: 'Test message',
    customProperties: {
        testproperty: 'TestValue'
  }};
  serviceBusService.sendQueueMessage('myqueue', message, function(error){
    if(!error){
      res.json(message);
    }
  });
});

app.get('/create_topic_message', function(req, res, next) {
  var message = {
    body: 'Test message topic',
    customProperties: {
        testproperty: 'TestValue'
  }};
  serviceBusService.sendTopicMessage('mytopic', message, function(error) {
    if (!error) {
      res.json(message);
    }
  });
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});