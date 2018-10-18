if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}

var express = require('express');
var app = express();
var azure = require('azure');
var port = process.env.PORT || 3000;
var axios = require('axios');

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

app.get('/ocapi', function(req, res, next) {
  axios({
    method: 'post',
    url: 'https://dev03-store-modcloth.demandware.net/dw/oauth2/access_token?client_id=c2bbf8ca-ba84-470c-a87b-46115a37bb97',
    data: 'grant_type=urn:demandware:params:oauth:grant-type:client-id:dwsid:dwsecuretoken',
    headers: {
        'Authorization': 'Basic bm9lbEBtaWNoZWxhZGEuaW86TWljaGVsYWRhXzY6VjgjM3IjUiVIQXZQVlAqJUhmNw==',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  .then(function(response) {
      if (response.data) {
        axios({
            method: 'get',
            url: 'https://dev03-store-modcloth.demandware.net/s/modcloth/dw/shop/v16_9/orders/00016306',
            headers: {
                'Authorization': 'Bearer ' + response.data.access_token,
                'Origin': 'https://dev03-store-modcloth.demandware.net'
            },
        }).then(function(order) {
          if (order) {
            axios({
              method: 'patch',
              url: 'https://dev03-store-modcloth.demandware.net/s/modcloth/dw/shop/v16_9/orders/00016306',
              headers: {
                  'Authorization': 'Bearer ' + response.data.access_token,
                  'Origin': 'https://dev03-store-modcloth.demandware.net',
                  'Content-Type': 'application/json'
              },
              data: {
                customer_name: 'Jhony'
              }
            }).then(function(modOrder) {
              // console.log(modOrder.data)
              res.json(modOrder.data);
            }).catch(function(err) {
              console.log(err)
              res.send('');
            })
          } else {
            res.json({ message: 'Error' });
          }
          // res.json(order.data);
        }).catch(function(err) {
            console.log(err);
            res.json(err);
        })
      }
  })
  .catch(function(err) {
      res.json(err);
      console.log(err);
  });
})

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});