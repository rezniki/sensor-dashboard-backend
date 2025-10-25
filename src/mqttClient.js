const { connect } = require('mqtt');
const logger = require('./logger');

function createMqttClient(cfg, onMessage) {
    const options = {
        host: cfg.host,
        port: cfg.port,
        username: cfg.user || undefined,
        password: cfg.password || undefined,
        protocol: cfg.protocol || 'mqtt',
        reconnectPeriod: 3000 // авто-переподключение каждые 3 сек
    };

    logger.info('Connecting to MQTT broker', `${cfg.host}:${cfg.port}`);
    const client = connect(options);

    // успешное подключение
    client.on('connect', () => {
        logger.info('MQTT connected');
        client.subscribe(cfg.topic, { qos: 0 }, (err, granted) => {
        if (err) {
            logger.error('Subscribe error:', err.message);
        } else {
            logger.info('Subscribed to topic', granted.map(g => g.topic).join(', '));
        }
        });
    });

    client.on('error', (err) => {
        logger.error('MQTT error:', err.message);
    });

    client.on('reconnect', () => {
        logger.info('Reconnecting to MQTT broker...');
    });

    client.on('close', () => {
        logger.warn('MQTT connection closed');
    });

    client.on('offline', () => {
        logger.warn('MQTT client offline');
    });

    // получение сообщений
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
