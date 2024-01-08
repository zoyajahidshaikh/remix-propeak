const amqp = require("amqplib");
const {
  rabbitMQ_exchangeName,
  rabbitMQ_connectionKey,
  companyCode
} = require('../config/config');

let exchangeName = rabbitMQ_exchangeName;

var open = amqp.connect(rabbitMQ_connectionKey);

// Publish a message to the exchange
// RabbitMQ will move it to the queue


function sendMessageToQueue(msg, qName, routingKey) {
  try {
    let msgQueue = companyCode + qName;
    routingKey = companyCode + routingKey;

    open
      .then(conn => {
        return conn.createChannel();
      })
      .then(ch => {
        // Bind a queue to the exchange to listen for messages
        // When we publish a message, it will be sent to this queue, via the exchange
        return ch
          .assertExchange(exchangeName, "direct", {
            durable: true
          })
          .then(() => {
            return ch.assertQueue(msgQueue, {
              exclusive: false
            });
          })
          .then(q => {
            return ch.bindQueue(q.queue, exchangeName, routingKey);
          })
          .then(() => {
            return ch.close();
          });
      })
      .catch(err => {
        // console.err(err);
        //process.exit(1);
        console.log(err);
      });

    var message = JSON.stringify(msg);

    return open
      .then(conn => {
        return conn.createChannel();
      })
      .then(ch => {
        //ch.publish(exchangeName, routingKey, new Buffer(message));
        ch.publish(exchangeName, routingKey, new Buffer(message));
        let msgTxt = message + " : Message sent at " + new Date();
        ch.close();
        return new Promise(resolve => {
          resolve(message);
        });
      });
  } catch (e) {
    console.log("error in index.js rabbitMq", e);
  }
}

// Get a message from the queue
function receiveMessageFromQueue(qName) {
  try {
    let q = companyCode + qName;
    return open
      .then(conn => {
        return conn.createChannel();
      })
      .then(ch => {
        return ch.get(q, {}).then(msgOrFalse => {
            return new Promise(resolve => {
              let result = "No messages in queue";
              if (msgOrFalse !== false) {
                result = JSON.parse(msgOrFalse.content.toString());
                ch.ack(msgOrFalse);
              }
              ch.close();
              resolve(result);
            });
          })
          .catch((err) => {
            console.log("receiveMessageFromQueue", err);
          });
      });
  } catch (e) {
    console.log(e);
  }

}


module.exports = {
  sendMessageToQueue,
  receiveMessageFromQueue
}