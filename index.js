if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}

var express = require('express');
var app = express();
var azure = require('azure');
var port = process.env.PORT || 3000;
var axios = require('axios');

var serviceBusService = azure.createServiceBusService();

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
  serviceBusService.sendTopicMessage('order-life-cycle', message, function(error) {
    if (!error) {
      res.json(message);
    }
  });
});

app.get('/global_e', (req, res, next) => {
  axios({
    method: 'post',
    url: `${process.env.GLOBAL_E_URL}/Order/UpdateOrderDispatchV2?merchantGUID=${process.env.MERCHANT_GUID}`,
    data: {
      OrderId: "GE2253796US",
      DeliveryReferenceNumber: "123756483",
      IsCompleted: true,
      Parcels: [
        {
          ParcelCode: "123454321",
          Products: [
            {
              DeliveryQuantity: 1,
              ProductCode: "100000021990"
            }
          ]
        }
      ]
    },
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'cache-control' : 'no-cache'
    }
  })
  .then(function(response) {
    console.log(response.data);
    res.json(response.data);
  })
  .catch(function(err) {
    console.log(err);
  });
});

app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});