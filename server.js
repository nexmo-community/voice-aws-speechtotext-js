'use strict'
require('dotenv').load()

const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const expressWs = require('express-ws')(app);
const http2 = require('http2');
const aws4  = require('aws4');

const Nexmo = require('nexmo');
const { Readable } = require('stream');

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
        'content-type': 'audio/l16;rate=16000',
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

console.log(new Date);
// Nexmo Websocket Handler
app.ws('/socket', (ws, req) => {

  console.log('socket connected');

  const urlOpts = {
    service: 'transcribe',
    region: 'us-east-1',
    host: 'transcribestreaming.us-east-1.amazonaws.com:443',
    path: '/stream-transcription',
    headers:{
     'content-type': 'application/vnd.amazon.eventstream',
     'x-amz-target': 'com.amazonaws.transcribe.Transcribe.StartStreamTranscription',
     'x-amz-content-sha256': 'STREAMING-AWS4-HMAC-SHA256-EVENTS'
    }
  }

  // ':method': 'POST',
  // ':path': '/stream-transcription',
  // 'authorization': urlObj.headers.Authorization,
  // 'x-amz-date': urlObj['headers']['X-Amz-Date'],
  // 'x-amz-target': 'com.amazonaws.transcribe.Transcribe.StartStreamTranscription',
  // 'x-amz-content-sha256': 'STREAMING-AWS4-HMAC-SHA256-EVENTS',
  // 'content-type': 'application/vnd.amazon.eventstream',

  let urlObj = aws4.sign(urlOpts, {accessKeyId: 'xxx', secretAccessKey: 'xxx'});

  const opts = {
    ...urlOpts,
    'x-amz-transcribe-language-code': process.env.LANG_CODE || 'en-US',
    'x-amz-transcribe-media-encoding': 'pcm',
    'x-amz-transcribe-sample-rate': 16000
  };

    const client = http2
    .connect('https://transcribestreaming.us-east-1.amazonaws.com')
    .on('connect', () => {
      console.log(client);
    })
    .on('goaway', () => console.log('client goaway'))
    .on('stream', () => console.log('client streaming'))
    .on('timeout', () => console.log('client timeout'))
    .on('ping', () => console.log('client ping'))
    .on('altsvc', () => console.log('client altsvc'))
    .on('origin', () => console.log('client origin'))
    .on('close', () => console.log('client close'))
    .on('frameError', () => console.log('client frameError'))
    .on('error', (err) => console.error(err));

  let stream = client.request(opts);
  stream
  .on('aborted', () => console.log('stream aborted'))
  .on('close', (headers, flags) => console.log('stream close'))
  .on('error', (err) => console.log(err))
  .on('frameError', () => console.log('frameError'))
  .on('timeout', () => console.log('timeout'))
  .on('trailers', () => console.log('trailers'))
  .on('wantTrailers', () => console.log('wantTrailers'))
  .on('continue', () => console.log('continue'))
  .on('headers', () => console.log('headers'))
  .on('push', () => console.log('push'))
  .on('ready', () => console.log(stream))
  .on('data', (data) => console.log(data.toString('utf8')))
  .on('response', (headers, flags) => console.log('stream response'))
  .on('end', () => {
    console.log('stream end')
    // stream = client.request(opts);
  })

  ws.on('message', (msg) => {
    if (typeof msg === 'string') {
      let config = JSON.parse(msg);
      client.ping((err, duration, payload) => {
        if (!err) {
          console.log(`Ping acknowledged in ${duration} milliseconds`);
          console.log(`With payload '${payload.toString()}'`);
        }
      });
    } else {
      let audioBlob = JSON.stringify({
         'AudioStream': {
            'AudioEvent': {
               'AudioChunk': msg
            }
         }
      });
      // console.log(audioBlob);
      stream.push(audioBlob);
      // stream.end();
    }

  });

  ws.on('close', () => {
    stream.end();
    client.destroy();
  })
});

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
