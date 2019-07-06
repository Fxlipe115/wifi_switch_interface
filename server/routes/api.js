require('dotenv').config();
const express = require('express');
const router = express.Router();
const adafruit = require('../adafruit');

var automatic = false;
const target = 1500;
const offset = 50;

router.get('/feed/:feed', async function(req, res, next) {
    let apiResponse = await adafruit.getLastFeed(req.params.feed);
    res.json(apiResponse);
});

router.post('/feed/', async function(req, res, next) {
    let apiResponse = await adafruit.setFeedValue(req.body.feed, req.body.value);
    res.json(apiResponse);
});

router.get('/auto/', async function(req, res, next) {
    res.json({status: automatic});
});

router.post('/auto/', async function(req, res, next) {
    automatic = req.body.status;
    res.json({status: automatic});
});


setInterval(async () => {
    if (automatic) {
        let switchOn = parseInt((await adafruit.getLastFeed('switch')).value) === 1;
        if (switchOn) {
            let luminosity = await adafruit.getLastFeed('ldr');
            let dimmer = await adafruit.getLastFeed('dimmer');

            let dimmerNextValue = await newDimmerValue(parseInt(luminosity.value), parseInt(dimmer.value));
            if (dimmerNextValue != dimmer.value) {
                await adafruit.setFeedValue('dimmer', dimmerNextValue);
            }
        }
    }
}, 4000);

async function newDimmerValue(luminosity, dimmer) {
    let dimmerValue = dimmer;
    let distanceFromTarget = Math.abs(luminosity - target);
    let stepSize = Math.ceil(Math.log((distanceFromTarget + 1)));

    // console.log(`luminosity: ${luminosity} |||  dimmer: ${dimmer}`);
    // console.log(`distanceFromTarget: ${distanceFromTarget}`);
    // console.log(`stepSize: ${stepSize}`);

    if (luminosity > (target + offset)) {
        dimmerValue = dimmer - stepSize;
        if(dimmerValue < 0) dimmerValue = 0;
    } else if (luminosity < (target - offset)) {
        dimmerValue = dimmer + stepSize;
        if(dimmerValue > 100) dimmerValue = 100;
    }

    console.log(dimmerValue);
    return dimmerValue;
}

function acceptable (lum) {
    if (lum > target + offset) return lum - target ;
    else if (lum < target - offset) return lum - target;
    else return 0;
}


// 0 - 4095 - valores do sensor de luminosidade

// 1500 - valor que o sensor pega quando a iluminação está boa
// 1450 a 1550 - é aceitável


module.exports = router;
