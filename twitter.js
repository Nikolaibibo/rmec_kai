var Twitter = require('twitter');
var pfio = require('piface-node');

// initializing the pfio lib for using the SPI and GPIO features of the piface board
pfio.init();

// config for strings, credentials for twitter, twilio and pushbullet git ignored
var config = require('./config.json');
var credentials = require('./credentials_kai.json');

var client = new Twitter({
  consumer_key: credentials.twitter_consumer_key,
  consumer_secret: credentials.twitter_consumer_secret,
  access_token_key: credentials.twitter_access_token_key,
  access_token_secret: credentials.twitter_access_token_secret
});

// var for not sending too much sms - by now with bad setTimeout
// TODO: change for performance
var isBusy = false;
var isPowered = false;
var waittime = 5000;
var pumpTime = 1200;

// hastag/searchterm for API
var searchTerm = "#Kai,#grexit,#qualitätsjournalismus,#paidcontent,#bushido,#valleytouri,#empörungsgesellschaft";

function powerUp () {
  isPowered = true;
  pfio.digital_write(0,1);
}

function powerDown () {
  //isPowered = false;
  pfio.digital_write(0,0);
  setTimeout(doReset, waittime);
}

function doReset () {
  isPowered = false;
}

// start reading stream
function startStream (conn) {
	
	console.log("LASS DIE HELDEN HEULEN - #kai");
	console.log("searching for hashtags: " + searchTerm);
	
	// using statuses/filter for hashtag search
 	client.stream('statuses/filter', {track:searchTerm}, function(stream) {
 		
    		stream.on('data', function(tweet) {
      			console.log("@" + tweet.user.screen_name + " :::: " + tweet.text + "  ::::  " + tweet.created_at);
      			//var tweetObject = {text:tweet.text, user:tweet.user.screen_name, time:tweet.created_at, location:tweet.user.location, userpic:tweet.user.profile_image_url};
            		if (!isPowered) powerUp();
            		setTimeout(powerDown, pumpTime);
		});

		stream.on('error', function(error) {
			powerDown();
      			throw error;
  		});
	});
}
// go
startStream();
