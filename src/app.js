const express = require('express');
const app = express();
app.use(express.json());

let contacts = [];
let nextId = 1;

// Función auxiliar para reiniciar datos entre pruebas (Evita contaminación de estado)
const resetData = () => {
  contacts = [
    { id: 1, name: 'Juan Perez', email: 'juan@mail.com', phone: '123456' },
    { id: 2, name: 'Maria Lopez', email: 'maria@mail.com' }
  ];
  nextId = 3;
};

// Inicialización por defecto
resetData();

// GET /api/contacts — devuelve todos los contactos
app.get('/api/contacts', (req, res) => {
  res.json(contacts);
});

// GET /api/contacts/:id — devuelve un contacto. Si no existe -> 404
app.get('/api/contacts/:id', (req, res) => {
  const contact = contacts.find(c => c.id === Number(req.params.id));
  if (!contact) return res.status(404).json({ error: 'Contacto no encontrado.' });
  res.json(contact);
});

// POST /api/contacts — crea un contacto
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
    ...(phone && { phone }) // Solo añade phone si viene en el body
  };

  contacts.push(newContact);
  res.status(201).json(newContact);
});

// PUT /api/contacts/:id — actualiza parcialmente un contacto existente
app.put('/api/contacts/:id', (req, res) => {
  const contact = contacts.find(c => c.id === Number(req.params.id));
  if (!contact) return res.status(404).json({ error: 'Contacto no encontrado.' });

  const { name, email, phone } = req.body;

  if (name !== undefined) contact.name = name;
  if (email !== undefined) contact.email = email;
  if (phone !== undefined) contact.phone = phone;

  res.json(contact);
});

// DELETE /api/contacts/:id — elimina un contacto
app.delete('/api/contacts/:id', (req, res) => {
  const index = contacts.findIndex(c => c.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Contacto no encontrado.' });

  contacts.splice(index, 1);
  res.status(200).json({ message: 'Contacto eliminado correctamente.' });
});

// Exportamos la app y el método de reinicio para los tests
module.exports = { app, resetData };