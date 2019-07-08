require('dotenv').config();
const express = require('express');
const router = express.Router();
const adafruit = require('../adafruit');
const helper = require('../helper');

global.runningRoutine = null;
global.target = 1500;
var routines = [];
var automatic = false;

// Feed
router.get('/feed/:feed', async function(req, res) {
    let apiResponse = await adafruit.getLastFeed(req.params.feed);
    res.json(apiResponse);
});

router.post('/feed/', async function(req, res) {
    let apiResponse = await adafruit.setFeedValue(req.body.feed, req.body.value);
    if (runningRoutine) clearInterval(runningRoutine);
    res.json(apiResponse);
});

// Automatic mode
router.get('/auto/', function(req, res) {
    res.json({status: automatic});
});

router.post('/auto/', async function(req, res) {
    automatic = req.body.status;
    if (automatic) target = parseInt((await adafruit.getLastFeed('sensor')).value);
    res.json({status: automatic});
});

// Rotinas
router.get('/routine/', function(req, res) {
    res.json({routines: routines});
});

router.post('/routine/', function(req, res) {
    let id = () => Math.random().toString(36).substr(2);
    let routine = {
        id: id(),
        rotina: helper.newRoutine(req.body.time, req.body.type.name),
        ...req.body,
    };
    routines.push(routine);
    res.json({routine: routine});
});

router.delete('/routine/:id', function(req, res) {
    routines = routines.filter(routine => routine.id !== req.params.id);
    res.json({deleted: true, routineId: req.params.id});
});

setInterval(async () => {
    if (automatic) {
        let switchOn = parseInt((await adafruit.getLastFeed('switch')).value) === 1;
        if (switchOn) {
            let luminosity = await adafruit.getLastFeed('sensor');
            let dimmer = await adafruit.getLastFeed('dimmer');

            let dimmerNextValue = await helper.newDimmerValue(parseInt(luminosity.value), parseInt(dimmer.value));
            if (dimmerNextValue != dimmer.value) {
                await adafruit.setFeedValue('dimmer', dimmerNextValue);
            }
        }
    }
}, 4000);

module.exports = router;
