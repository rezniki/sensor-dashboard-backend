const { connect } = require('mqtt');
const logger = require('./logger');

function createMqttClient(cfg, onMessage) {
    const options = {
        host: cfg.host,
        port: cfg.port,
        username: cfg.user || undefined,
        password: cfg.password || undefined,
        protocol: 'mqtt'
    };

    logger.info('Connecting to MQTT broker', `${cfg.host}:${cfg.port}`);
    const client = connect(options);

    client.on('connect', () => {
        logger.info('MQTT connected');
        client.subscribe(cfg.topic)
        .then(() => logger.info('Subscribed to topic', cfg.topic))
        .catch((err) => logger.error('Subscribe error', err));
    });

    client.on('error', (err) => logger.error('MQTT error', err));

    client.on('message', (topic, payloadBuf) => {
        const payload = payloadBuf.toString();
        const value = parseFloat(payload);
        const ts = Date.now();

        if (!Number.isFinite(value)) {
        logger.warn('Received non-numeric payload:', payload);
        return;
        }
        if (value < 0 || value > 100) {
        logger.warn('Value out of range (0–100):', value);
        return;
        }

        onMessage({ topic, value, ts });
    });

    return client;
}

module.exports = { createMqttClient };
