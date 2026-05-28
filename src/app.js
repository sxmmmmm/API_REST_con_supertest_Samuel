const express = require('express');
const app = express();
app.use(express.json());

let contacts = [];
let nextId = 1;

const resetData = () => {
    contacts = [
        { id: 1, name: 'david Perez', email: 'david@mail.com', phone: '6544321' },
        { id: 2, name: 'samuel Trujillo', email: 'samuel@mail.com', phone: '12123718' }
    ];
    nextId = 3;
};

resetData();

app.get('/api/contacts', (req, res) => {
    res.json(contacts);
});

app.get('/api/contacts/:id', (req, res) => {
    const contact = contacts.find(c => c.id === Number(req.params.id));
    if (!contact) return res.status(404).json({ error: 'Contacto no encontrado.' });
    res.json(contact);
});

app.post('/api/contacts', (req, res) => {
    const { name, email, phone } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'El nombre y el email son requeridos.' });
    }

    if (!email.includes('@')) {
        return res.status(400).json({ error: 'El email debe contener un @.' });
    }

    const newContact = {
        id: nextId++,
        name,
        email,
        ...(phone && { phone })
    };

    contacts.push(newContact);
    res.status(201).json(newContact);
});

app.put('/api/contacts/:id', (req, res) => {
    const contact = contacts.find(c => c.id === Number(req.params.id));
    if (!contact) return res.status(404).json({ error: 'Contacto no encontrado.' });

    const { name, email, phone } = req.body;

    if (name !== undefined) contact.name = name;
    if (email !== undefined) contact.email = email;
    if (phone !== undefined) contact.phone = phone;

    res.json(contact);
});

app.delete('/api/contacts/:id', (req, res) => {
    const index = contacts.findIndex(c => c.id === Number(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Contacto no encontrado.' });

    contacts.splice(index, 1);
    res.status(200).json({ message: 'Contacto eliminado correctamente.' });
});

module.exports = { app, resetData };