'use strict'
require('dotenv').load()

const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const expressWs = require('express-ws')(app);
const WebSocket = require('ws');
const marshaller = require("@aws-sdk/eventstream-marshaller"); // for converting binary event stream messages to and from JSON
const util_utf8_node = require("@aws-sdk/util-utf8-node"); // utilities for encoding and decoding UTF8
const v4 = require('./aws-signature-v4');
const crypto = require('crypto'); // to sign our pre-signed URL
const Nexmo = require('nexmo');

const eventStreamMarshaller = new marshaller.EventStreamMarshaller(util_utf8_node.toUtf8, util_utf8_node.fromUtf8);

const nexmo = new Nexmo({
  apiKey: 'dummy',
  apiSecret: 'dummy',
  applicationId: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY || './private.key'
});

app.use(bodyParser.json());

app.get('/ncco', (req, res) => {

  let nccoResponse = [
    {
      'action': 'connect',
      'endpoint': [{
        'type': 'websocket',
        'content-type': `audio/l16;rate=${process.env.SAMPLE_RATE}`,
        'uri': `ws://${req.hostname}/socket`
      }]
    }
  ];

  res.status(200).json(nccoResponse);
});

app.post('/event', (req, res) => {
  // console.log('EVENT LOG::', req.body)
  res.status(204).end();
});

// Nexmo Websocket Handler
app.ws('/socket', (ws, req) => {

  console.log('Socket Connected');

  let url = v4.createPresignedURL(
    'GET',
    `transcribestreaming.${process.env.AWS_REGION}.amazonaws.com:8443`,
    '/stream-transcription-websocket',
    'transcribe',
    crypto.createHash('sha256').update('', 'utf8').digest('hex'), {
        'key': process.env.AWS_ACCESS_KEY_ID,
        'secret': process.env.AWS_SECRET_ACCESS_KEY,
        'protocol': 'wss',
        'expires': 15,
        'region': process.env.AWS_REGION,
        'query': `language-code=${process.env.LANG_CODE}&media-encoding=pcm&sample-rate=${process.env.SAMPLE_RATE}`
    }
  );

  let socket = new WebSocket(url);

  socket.binaryType = "arraybuffer";
  wireSocketEvents(socket);

  socket.on('open', () => {
    ws.on('message', (msg) => {
      if (typeof msg === 'string') {
        let config = JSON.parse(msg);

      } else {
        if (socket.OPEN) {
          let buf = getAudioEventMessage(msg);
          let binary = eventStreamMarshaller.marshall(buf);
          socket.send(binary);
        }
      }

    });
  });

  ws.on('close', () => { //close down open sockets
    console.log('Closing sockets');
    socket.close();
  })

  ws.on('error', (err) => {
    console.warn(err);
  })
});

function getAudioEventMessage(buffer) {
    // wrap the audio data in a JSON envelope
    return {
        headers: {
            ':message-type': {
                type: 'string',
                value: 'event'
            },
            ':event-type': {
                type: 'string',
                value: 'AudioEvent'
            }
        },
        body: buffer
    };
}

function wireSocketEvents(socket) {
    // handle inbound messages from Amazon Transcribe
    socket.onmessage = function (message) {
        //convert the binary event stream message to JSON
        let messageWrapper = eventStreamMarshaller.unmarshall(Buffer.from(message.data));
        let messageBody = JSON.parse(String.fromCharCode.apply(String, messageWrapper.body));

        // Uncomment for full response
        // console.dir(messageBody.Transcript.Results, {depth: null});

        // Show transcript only
        if (messageBody.Transcript.Results[0]) {
          console.log('AWS Transcription::: ', messageBody.Transcript.Results[0].Alternatives[0].Transcript);
        }
    };

    socket.onerror = function (err) {
        console.warn('AWS socket error:::', err);
    };

    socket.onclose = function (closeEvent) {
        console.log('AWS socket closed');
    };
}

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
