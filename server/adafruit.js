const config = {
    user: process.env.ADAFRUIT_IO_USER,
    key: process.env.ADAFRUIT_IO_KEY,
    url: 'https://io.adafruit.com/api/v2/'
};

const axios = require('axios');
axios.defaults.headers.common['X-AIO-KEY'] = config.key;

module.exports = {
    getLastFeed: async (feed) => {
        return (await axios.get(`${config.url}/${config.user}/feeds/${feed}/data?limit=1`).then(res => res.data))[0]
    },
    setFeedValue: async (feed, value) => {
        return (await axios.post(`${config.url}/${config.user}/feeds/${feed}/data`, {value: value}).then(res => res.data))
    },
};


