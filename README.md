# Nexmo + AWS Transcrive Streaming API WebSocket Demo
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://nexmo.dev/aws-nexmo-transcribe-heroku)

You can use this code as a base for doing real time transcription of a phone call using [AWS Transcribe Streaming API](https://aws.amazon.com/transcribe/). You can read more about this [here](https://aws.amazon.com/blogs/aws/amazon-transcribe-streaming-now-supports-websockets/)

An audio stream is sent via WebSockets connection to your server and then relayed to the AWS Transcribe Streaming API service. Speech transcription is performed and the text returned to the console.

## AWS Transcribe Streaming API WebSocket Setup
You will need to authorize an [IAM user](https://console.aws.amazon.com/) by attaching the following policy to your user:

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

## Running the App

### Running on Heroku

In order to run this on Heroku, you will need to gather the following information:

1. `API_KEY` - This is the API key from your Nexmo Account.
1. `API_SECRET` - This is the API secret from your Nexmo Account.
1. `LANG_CODE` - The language code. One of en-US, en-GB, fr-FR, fr-CA, es-US.
1. `SAMPLE_RATE` - The sample rate of the audio, in Hz. Max of 16000 for en-US and es-US, and 8000 for the other languages
1. `AWS_REGION` - Your AWS region.
1. `AWS_ACCESS_KEY_ID` - The AWS access key ID from the IAM user.
1. `AWS_SECRET_ACCESS_KEY` - The AWS secret access key from the IAM user.

This will create a new Nexmo application and phone number to begin testing with. View the logs to see the transcription response from the service. You can do this in the Heroku dashboard, or with the Heroku CLI using `heroku logs -t`.

### Linking the app to Nexmo
You will need to create a new Nexmo application in order to work with this app:

#### Create a Nexmo Application Using the Command Line Interface

Install the CLI by following [these instructions](https://github.com/Nexmo/nexmo-cli#installation). Then create a new Nexmo application that also sets up your `answer_url` and `event_url` for the app running locally on your machine.

```
nexmo app:create aws-transcribe https://<your_hostname>/ncco https://<your_hostname>/event
```

This will return an application ID. Make a note of it.

#### Buy a New Virtual Number
If you don't have a number already in place, you will need to buy one. This can also be achieved using the CLI by running this command:

```
nexmo number:buy
```

#### Link the Virtual Number to the Application
Finally, link your new number to the application you created by running:

```
nexmo link:app YOUR_NUMBER YOUR_APPLICATION_ID
```

### Local Install

To run this on your machine you'll need an up-to-date version of Node.

Start by installing the dependencies with:

```
npm install
```

Then copy the example.env file to a new file called .env:

```
cp .env.example > .env
```

Edit the .env file to add in your application ID and the credentials from the authorized IAM user..

```yaml
APP_ID=
LANG_CODE= (One of en-US, en-GB, fr-FR, fr-CA, es-US)
SAMPLE_RATE= (Max of 16000 for en-US and es-US, and 8000 for the other languages)
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

Tools like [ngrok](https://ngrok.com/) are great for exposing ports on your local machine to the internet. If you haven't done this before, [check out this guide](https://www.nexmo.com/blog/2017/07/04/local-development-nexmo-ngrok-tunnel-dr/).

### Using Docker
To run the app using Docker run the following command in your terminal:

```
docker-compose up
```

This will create a new image with all the dependencies and run it at http://localhost:8000.
