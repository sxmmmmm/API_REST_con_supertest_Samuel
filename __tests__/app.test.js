const request = require('supertest');
const { app, resetData } = require('../src/app');

describe('API de Contactos', () => {
  
  // Se ejecutan las limpiezas de datos antes de cada caso individual
  beforeEach(() => {
    resetData();
  });

  describe('GET /api/contacts', () => {
    it('devuelve status 200 y un array', async () => {
      const res = await request(app).get('/api/contacts');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/contacts/:id', () => {
    it('devuelve el contacto correcto', async () => {
      const res = await request(app).get('/api/contacts/1');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: 1, name: 'Juan Perez' });
    });

    it('devuelve 404 para un ID inexistente', async () => {
      const res = await request(app).get('/api/contacts/999');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/contacts', () => {
    it('crea el contacto y devuelve 201 con el objeto creado', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .send({ name: 'Carlos Gomez', email: 'carlos@mail.com', phone: '987654' });
      
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ name: 'Carlos Gomez', email: 'carlos@mail.com', phone: '987654' });
      expect(res.body.id).toBeDefined();
    });

    it('devuelve 400 si falta el name', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .send({ email: 'test@mail.com' });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('devuelve 400 si el email no tiene @', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .send({ name: 'Luis', email: 'luis_mail.com' });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/contacts/:id', () => {
    it('actualiza correctamente los campos enviados', async () => {
      const res = await request(app)
        .put('/api/contacts/1')
        .send({ name: 'Juan Actualizado' });
      
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Juan Actualizado');
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('elimina el contacto y devuelve confirmación', async () => {
      const res = await request(app).delete('/api/contacts/2');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
    });

    it('devuelve 404 para ID inexistente', async () => {
      const res = await request(app).delete('/api/contacts/999');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});