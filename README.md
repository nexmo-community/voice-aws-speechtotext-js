# Nexmo + AWS Transcrive Streaming API WebSocket Demo
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://nexmo.dev/aws-nexmo-transcribe-heroku)

Use this code as a base for doing real time transcription of a phone call using [AWS Transcribe Streaming API](https://aws.amazon.com/transcribe/). Read more about this [here](https://aws.amazon.com/blogs/aws/amazon-transcribe-streaming-now-supports-websockets/)

An audio stream is sent via WebSockets connection to the resulting server and then relayed to the AWS Transcribe Streaming API service. Speech transcription is performed and the text returned to the console.

## AWS Transcribe Streaming API WebSocket Setup
Authorize an [IAM user](https://console.aws.amazon.com/iam/home) by attaching the following policy to a user:
(In IAM select the user, then click "Add inline policy" to the right and select the JSON tab. Inline is required because it appears the AWS interface has not yet been updated with the new function.)

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "transcribestreaming",
            "Effect": "Allow",
            "Action": "transcribe:StartStreamTranscriptionWebSocket",
            "Resource": "*"
        }
    ]
}
```
NOTE: The AWS panel will indicate `transcribe:StartStreamTranscriptWebSocket` is unknown. Ignore that.

## Running the App

### Running on Heroku

In order to run this on Heroku, gather the following information and edit app.json:

1. `API_KEY` - This is the API key from a Nexmo Account.
1. `API_SECRET` - This is the API secret from a Nexmo Account.
1. `LANG_CODE` - The language code. One of en-US, en-GB, fr-FR, fr-CA, es-US.
1. `SAMPLE_RATE` - The sample rate of the audio, in Hz. Max of 16000 for en-US and es-US, and 8000 for the other languages. Phone conversations are recommended at 8000.
1. `AWS_REGION` - AWS region. See - [AWS Availability Regions](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-available-regions)
1. `AWS_ACCESS_KEY_ID` - The AWS access key ID from the IAM user.
1. `AWS_SECRET_ACCESS_KEY` - The AWS secret access key from the IAM user.

This will create a new Nexmo application and phone number to begin testing with. View the logs to see the transcription response from the service. This can be done through the Heroku dashboard, or with the Heroku CLI using `heroku logs -t`.

### Local Installation

To run this locally, install an up-to-date version of Node.

Start by installing the dependencies with:

```
npm install
```

Then copy the example.env file to a new file called .env:

```
cp .env.example > .env
```

Edit the .env file to add in an application ID and the credentials from the authorized IAM user..

```yaml
APP_ID=
LANG_CODE= (One of en-US, en-GB, fr-FR, fr-CA, es-US)
SAMPLE_RATE= (Max of 16000 for en-US and es-US, and 8000 for the other languages.  Phone conversations are recommended at 8000.)
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

Now serve it up, and then use something like Ngrok to serve it 
```
node server.js
```

This will create a new image with all the dependencies and run it at http://localhost:8000.


Tools like [ngrok](https://ngrok.com/) are great for exposing ports from a local machine to the internet. For instructions, [check out this guide](https://www.nexmo.com/blog/2017/07/04/local-development-nexmo-ngrok-tunnel-dr/).

### Using Docker
To run the app using Docker run the following command in a terminal:

```
docker-compose up
```

This will create a new image with all the dependencies and run it at http://localhost:8000.

## Linking the app to Nexmo
Create a new Nexmo Voice application for this app, and associated it with a Nexmo number.

### Create a Nexmo Application Using the Command Line Interface

Install the CLI by following [these instructions](https://github.com/Nexmo/nexmo-cli#installation). Then create a new Nexmo Voice application that also sets up an `answer_url` and `event_url` for the app running locally on the machine.

Ensure to append /ncco or /event to the end of the URL to coincide with the routes in the script.

```
nexmo app:create aws-transcribe https://<your_hostname>/ncco https://<your_hostname>/event
```
nexmo app:create aws-transcribe {answer_url} {event_url}

IMPORTANT: This will return an application ID, and a private key. The application ID will be needed for the nexmo link:app as well as the .env file later, and create a file named private.key in the same location/level as server.js, by default, containing the private key.

### Obtain a New Virtual Number
If you don't have a number already in place, obtain one from Nexmo. This can also be achieved using the CLI by running this command:

```
nexmo number:buy
```

### Link the Virtual Number to the Application
Finally, link the new number to the created application by running:

```
nexmo link:app YOUR_NUMBER YOUR_APPLICATION_ID
```


