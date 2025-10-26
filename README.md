# 📡 Sensor Dashboard — Backend

Backend-сервер для сбора и трансляции данных с датчиков температуры.  
Работает на **Node.js + Express + MQTT + Socket.IO + SQLite**.  
Поддерживает REST API, WebSocket и генерацию тестовых данных.

---

## 🧠 Краткое описание

Этот сервер принимает данные от MQTT-брокера (или публикует их сам),  
сохраняет их в SQLite базу и рассылает подключённым клиентам через Socket.IO.

Используется в связке с фронтендом — [Sensor Dashboard Frontend](https://github.com/rezniki/sensor-dashboard-frontend).

---

## 🚀 Основные возможности

- Приём показаний с MQTT-брокера (по топику `sensor/temperature`)
- Хранение истории в локальной базе SQLite (`data/readings.db`)
- REST API `/api/readings` для получения истории
- Socket.IO для live-трансляции новых данных
- Генерация тестовых данных (имитация реальных показаний)
- Автопубликация 10 новых значений при каждом запуске

---

## 🧩 Технологии

| Компонент | Используется |
|------------|---------------|
| Язык | Node.js (v20+) |
| Сервер | Express |
| Брокер данных | MQTT (через библиотеку `mqtt`) |
| WebSocket | Socket.IO |
| База данных | SQLite (через `better-sqlite3`) |
| Dev tools | Nodemon, Winston (логирование) |

---

## ⚙️ Установка и запуск (локально)

### 1 Клонирование и переход в папку
```bash
git clone <https://github.com/rezniki/sensor-dashboard-frontend>
cd sensor-dashboard-backend
```

### 2 Установка зависимостей
```bash
npm install
```

### 3 Запуск сервера (dev)
```bash
npm run dev
```

### По умолчанию сервер слушает порт:
```bash
http://localhost:4000
```
