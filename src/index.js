const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const { init } = require('./db');
const { createMqttClient } = require('./mqttClient');
const logger = require('./logger');

// Загрузка конфигурации
const configPath = path.resolve(__dirname, '..', 'config.json');
if (!fs.existsSync(configPath)) {
    console.error('Cannot find config.json. Create one based on provided example.');
    process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Инициализация БД
const db = init(config.db.path);

// REST API: получаем всю историю (опционально можно добавить пагинацию)
app.get('/api/readings', (req, res) => {
    try {
        const rows = db.getAll();
        // возвращаем массив с читаемыми timestamp в ms
        res.json(rows.map(r => ({ id: r.id, topic: r.topic, value: r.value, ts: r.ts })));
    } catch (err) {
        logger.error('Failed to fetch readings', err);
        res.status(500).json({ error: 'Failed to fetch readings' });
    }
});

// Websocket: при подключении клиента отправляем всю историю
io.on('connection', (socket) => {
    logger.info('Client connected via Socket.IO', socket.id);
    // отправляем историю
    try {
        const rows = db.getAll();
        socket.emit('history', rows.map(r => ({ id: r.id, topic: r.topic, value: r.value, ts: r.ts })));
    } catch (err) {
        logger.error('Error sending history to client', err);
    }

    socket.on('disconnect', (reason) => {
        logger.info('Socket disconnected', socket.id, reason);
    });
});

// Обработчик новых сообщений от MQTT
function handleNewReading({ topic, value, ts }) {
    try {
        const id = db.insert(topic, value, ts);
        const payload = { id, topic, value, ts };
        // Рассылаем всем подписчикам
        io.emit('new-reading', payload);
    } catch (err) {
        logger.error('Failed to handle new reading', err);
    }
}

// Запуск MQTT клиента
const mqttClient = createMqttClient(config.mqtt, handleNewReading);

const PORT = config.server.port || 4000;
server.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
    logger.info(`Socket.IO ready - clients can connect to ws://<host>:${PORT}`);
    logger.info(`REST endpoint GET /api/readings`);
});
