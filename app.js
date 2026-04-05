const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(express.json()); // Щоб сервер розумів дані у форматі JSON

// --- ПІДКЛЮЧЕННЯ ДО БАЗИ (Твій файл vet_clinic) ---
const dbPath = path.resolve(__dirname, 'vet_clinic'); 
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Помилка підключення до бази:', err.message);
    } else {
        console.log('Успіх! Підключено до бази: ' + dbPath);
    }
});

// --- 1. Отримати всіх тварин (GET) ---
app.get('/animals', (req, res) => {
    const query = `
        SELECT a.id, a.name AS pet_name, a.species, o.name AS owner_name 
        FROM animals a 
        LEFT JOIN owners o ON a.owner_id = o.id`;
    
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// --- 2. Додати нову тварину (POST) ---
app.post('/animals', (req, res) => {
    const { name, species, owner_id } = req.body;
    const query = 'INSERT INTO animals (name, species, owner_id) VALUES (?, ?, ?)';
    
    db.run(query, [name, species, owner_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Тварину додано!', id: this.lastID });
    });
});

// --- 3. Оновити дані тварини (PUT) ---
app.put('/animals/:id', (req, res) => {
    const { id } = req.params;
    const { name, species } = req.body;
    const query = 'UPDATE animals SET name = ?, species = ? WHERE id = ?';
    
    db.run(query, [name, species, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Дані оновлено!', changes: this.changes });
    });
});

// --- 4. Видалити тварину (DELETE) ---
app.delete('/animals/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM animals WHERE id = ?';
    
    db.run(query, id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Тварину видалено!', changes: this.changes });
    });
});

// Запуск сервера
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер працює на http://localhost:${PORT}`);
    console.log(`Доступні маршрути: GET, POST, PUT, DELETE на /animals`);
});