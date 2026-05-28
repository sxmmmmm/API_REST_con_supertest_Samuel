const express = require('express');
const app = express();
app.use(express.json());

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sendError(res, status, message) {
    return res.status(status).json({
        status: status,
        error: message
    });
}

let contacts = [
    { id: 1, name: 'Ana García', email: 'ana@example.com', phone: '555-0001', favorite: false, createdAt: '2024-01-10T08:00:00.000Z' },
    { id: 2, name: 'Luis Pérez', email: 'luis@example.com', phone: '555-0002', favorite: true, createdAt: '2024-01-11T09:00:00.000Z' },
    { id: 3, name: 'Eva Martínez', email: 'eva@example.com', phone: null, favorite: false, createdAt: '2024-01-12T10:00:00.000Z' },
];

let nextId = 4;

function resetContacts() {
    contacts = [
        { id: 1, name: 'Ana García', email: 'ana@example.com', phone: '555-0001', favorite: false, createdAt: '2024-01-10T08:00:00.000Z' },
        { id: 2, name: 'Luis Pérez', email: 'luis@example.com', phone: '555-0002', favorite: true, createdAt: '2024-01-11T09:00:00.000Z' },
        { id: 3, name: 'Eva Martínez', email: 'eva@example.com', phone: null, favorite: false, createdAt: '2024-01-12T10:00:00.000Z' },
    ];
    nextId = 4;
}

app.get('/api/contacts', (req, res) => {
    const { search, favorite } = req.query;
    let filteredContacts = [...contacts];

    if (search) {
        const term = search.toLowerCase();
        filteredContacts = filteredContacts.filter(c =>
            c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term)
        );
    }

    if (favorite) {
        const isFavorite = favorite === 'true';
        filteredContacts = filteredContacts.filter(c => c.favorite === isFavorite);
    }

    res.status(200).json(filteredContacts);
});

app.get('/api/contacts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const contact = contacts.find(c => c.id === id);

    if (!contact) {
        return sendError(res, 404, 'Contacto no encontrado.');
    }

    res.status(200).json(contact);
});

app.post('/api/contacts', (req, res) => {
    const { name, email, phone, favorite } = req.body;

    if (!name || name.trim() === '') {
        return sendError(res, 400, 'El campo name es requerido.');
    }

    if (!email || !EMAIL_REGEX.test(email)) {
        return sendError(res, 400, 'El formato del email es inválido.');
    }

    const isDuplicate = contacts.some(c => c.email.toLowerCase() === email.toLowerCase());
    if (isDuplicate) {
        return sendError(res, 409, 'Ya existe un contacto con ese email.');
    }

    const newContact = {
        id: nextId++,
        name: name,
        email: email,
        phone: phone || null,
        favorite: favorite || false,
        createdAt: new Date().toISOString(),
    };

    contacts.push(newContact);
    res.status(201).json(newContact);
});

app.patch('/api/contacts/:id/favorite', (req, res) => {
    const id = parseInt(req.params.id);
    const contact = contacts.find(c => c.id === id);

    if (!contact) {
        return sendError(res, 404, 'Contacto no encontrado.');
    }

    contact.favorite = !contact.favorite;
    res.status(200).json(contact);
});

app.put('/api/contacts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const contact = contacts.find(c => c.id === id);

    if (!contact) {
        return sendError(res, 404, 'Contacto no encontrado.');
    }

    const { name, email, phone, favorite } = req.body;

    if (email !== undefined && (!email || !EMAIL_REGEX.test(email))) {
        return sendError(res, 400, 'El formato del email es inválido.');
    }

    if (email && email.toLowerCase() !== contact.email.toLowerCase()) {
        const isDuplicate = contacts.some(c => c.id !== id && c.email.toLowerCase() === email.toLowerCase());
        if (isDuplicate) {
            return sendError(res, 409, 'Ya existe un contacto con ese email.');
        }
    }

    if (name !== undefined) contact.name = name;
    if (email !== undefined) contact.email = email;
    if (phone !== undefined) contact.phone = phone;
    if (favorite !== undefined) contact.favorite = favorite;

    res.status(200).json(contact);
});

app.get('/contacts', (req, res) => res.json(contacts));

app.post('/contacts', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email || !EMAIL_REGEX.test(email)) return res.status(400).json({ error: 'error' });
    const newC = { id: nextId++, name, email, phone: req.body.phone || null, favorite: req.body.favorite || false, createdAt: new Date().toISOString() };
    contacts.push(newC);
    res.status(201).json(newC);
});

app.delete('/contacts/:id', (req, res) => {
    const idx = contacts.findIndex(c => c.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'error' });
    contacts.splice(idx, 1);
    res.status(204).send();
});

app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada.' });
});

module.exports = { app, resetContacts };