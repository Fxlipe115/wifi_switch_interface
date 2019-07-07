const adafruit = require('./adafruit');
const cron = require('node-cron');
const offset = 50;

module.exports = {
    newDimmerValue: async function(luminosity, dimmer) {
        let dimmerValue = dimmer;
        // let distanceFromTarget = Math.abs(luminosity - target);
        // let stepSize = Math.ceil(Math.log((distanceFromTarget + 1)));
        let stepSize = 1;

        // console.log(`Luminosity: ${luminosity} | Dimmer: ${dimmer}`);
        // console.log(`distanceFromTarget: ${distanceFromTarget}`);
        // console.log(`stepSize: ${stepSize}`);

        if (luminosity > (target + offset)) {
            dimmerValue = dimmer - stepSize;
            if(dimmerValue < 0) dimmerValue = 0;
        } else if (luminosity < (target - offset)) {
            dimmerValue = dimmer + stepSize;
            if(dimmerValue > 100) dimmerValue = 100;
        }

        return dimmerValue;
    },
    newRoutine: async function(time, type) {
        let h = time.split(':')[0];
        let m = time.split(':')[1];

        return cron.schedule(`${m} ${h} * * *`, async () => {
            let switchOn = parseInt((await adafruit.getLastFeed('switch')).value) === 1;

            if(runningRoutine) clearInterval(runningRoutine);
            switch (type) {
                case 'Anoitecer':
                    // No need to perform dusk if lights are already turned off
                    if(switchOn){
                        runningRoutine = setInterval(async () => {
                            let dimmer = parseInt((await adafruit.getLastFeed('dimmer')).value);
                            if(dimmer > 0){
                                await adafruit.setFeedValue('dimmer', (dimmer - 1));
                                io.emit('dimmer', (dimmer - 1));
                            } else {
                                // Turn switch off too
                                // io.emit('status', 0);
                                await adafruit.setFeedValue('switch', 0);
                                io.emit('status', 0);
                                clearInterval(runningRoutine);
                            }
                        }, 4000);
                    }
                    break;
                case 'Amanhecer':
                    // Turn Switch on, if needed
                    if(!switchOn){
                        // Reset dimmer
                        await adafruit.setFeedValue('dimmer', 0);
                        io.emit('dimmer', 0);
                        // Turn Switch on
                        await adafruit.setFeedValue('switch', 1);
                        io.emit('status', 1);
                    }
                    runningRoutine = setInterval(async () => {
                        let dimmer = parseInt((await adafruit.getLastFeed('dimmer')).value);
                        if(dimmer < 100) {
                            await adafruit.setFeedValue('dimmer', (dimmer + 1));
                            io.emit('dimmer', (dimmer + 1));
                        } else {
                            clearInterval(runningRoutine);
                        }
                    }, 4000);
                    break;
                case 'Ligar':
                    // Turn Switch on
                    await adafruit.setFeedValue('switch', 1);
                    io.emit('status', 1);
                    break;
                default:
                    // Turn Switch off
                    await adafruit.setFeedValue('switch', 0);
                    io.emit('status', 0);
            }
        });
    }
};

// function acceptable (lum) {
//     if (lum > target + offset) return lum - target ;
//     else if (lum < target - offset) return lum - target;
//     else return 0;
// }