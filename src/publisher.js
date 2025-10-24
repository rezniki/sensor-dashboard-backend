const { connect } = require('mqtt');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'config.json'), 'utf8'));

const options = {
    host: config.mqtt.host,
    port: config.mqtt.port,
    username: config.mqtt.user || undefined,
    password: config.mqtt.password || undefined,
    protocol: 'mqtt'
};

const client = connect(options);

client.on('connect', async () => {
    logger.info('Publisher connected to MQTT broker');
    const topic = config.mqtt.topic;

    for (let i = 0; i < 10; i++) {
        const value = (36 + Math.random() * 2).toFixed(1);
        await new Promise((r) => setTimeout(r, 200));
        client.publish(topic, value);
        logger.info(`Published: ${value}`);
    }

    setTimeout(() => {
        client.end();
        logger.info('Publisher finished');
    }, 500);
});

client.on('error', (err) => logger.error('Publisher error:', err));
