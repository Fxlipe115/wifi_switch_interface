const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const app = express();

var values = {dimmer: 0, switch: 0, sensor: 0};
var target = 1500;
const ADAFRUIT_IO_KEY = '';
const ADAFRUIT_IO_USER = '';
const offset = 50;


app.set('view engine', 'ejs')
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.render('index', {values: values});
});

app.post('/', function (req, res) {
    values.dimmer = req.body.dimmer;
    publishToFeed('dimmer', values.dimmer);
    res.render('index', {values: values});
    console.log(req.body.dimmer);
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
    setInterval(() => {
        getValueOfFeed("dimmer", () => {
            getValueOfFeed("sensor", () => {
                getValueOfFeed("switch", () => {
                    updateDimmer();
                    console.log(values);
                });
            });
        });
    }, 5000);
});

function acceptable(lum) {                                                                                      
    if (lum > desired + offset) {
        return 1;
    } else if (lum < desired - offset) {
        return -1;
    } else {
        return 0;
    }
}

function getRequestObjectForFeed(feed) {
    return {url:'https://io.adafruit.com/api/v2/'+ADAFRUIT_IO_USER+'/feeds/'+feed+'/data?limit=1', 
        headers:{'X-AIO-KEY': ADAFRUIT_IO_KEY}, json: true}
}

function getValueOfFeed(feed, callback) {
    request(getRequestObjectForFeed(feed), (err, res, body) => {
        if (err) { return console.log(err); }
        values[feed] = body[0].value;
        if(callback) { callback(); }
    });
}

function getPostObjectForFeed(feed, value) {
    return {url:'https://io.adafruit.com/api/v2/'+ADAFRUIT_IO_USER+'/feeds/'+feed+'/data', 
        headers:{'X-AIO-KEY': ADAFRUIT_IO_KEY}, form:{'value': value}}
}

function publishToFeed(feed, value, callback) {
    request.post(getPostObjectForFeed(feed, value), (err, res, body) => {
        if (err) { return console.log(err); }
        if (callback) { callback(); }
    });
}

function acceptable (lum) {
    if (lum > target + offset)
        return 1;
    else if (lum < target - offset)
        return -1;
    else
        return 0;
}

function updateDimmer() {
    if (acceptable(values.sensor) < 0 && values.dimmer <= 100)
        publishToFeed('dimmer', +values.dimmer+1);
    else if (acceptable(values.sensor) > 0 && values.dimmer >= 0)
        publishToFeed('dimmer', +values.dimmer-1);
}


