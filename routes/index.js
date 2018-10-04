var express = require('express');
var router = express.Router();
var azure = require('azure');

var serviceBusService = azure.createServiceBusService();
serviceBusService.createQueueIfNotExists('myqueue', function(error){
  if(!error){
    console.log('Service Bus Created');
  } else {
    console.log(error);
  }
});

serviceBusService.receiveQueueMessage('myqueue', function(error, receivedMessage){
  if(!error){
    console.log('Message received and deleted')
    console.log(receivedMessage);
  } else {
    console.log(error);
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/create_message', function(req, res, next) {
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

module.exports = router;
