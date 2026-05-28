const request = require('supertest');
const { app, resetContacts } = require('../src/app');

describe('API de Contactos Avanzada - Ejercicio 6', () => {

    beforeEach(() => {
        resetContacts();
    });

    describe('Bloque A: POST /api/contacts (Validación con Regex)', () => {

        it('devuelve 400 cuando el email es "@" (sin usuario ni dominio)', async() => {
            const res = await request(app)
                .post('/api/contacts')
                .send({ name: 'Carlos Díaz', email: '@' });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/email/i);
        });

        it('devuelve 400 cuando el email es "usuario@" (sin dominio)', async() => {
            const res = await request(app)
                .post('/api/contacts')
                .send({ name: 'Carlos Díaz', email: 'usuario@' });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/email/i);
        });

        it('devuelve 400 cuando el email es "@dominio.com" (sin usuario)', async() => {
            const res = await request(app)
                .post('/api/contacts')
                .send({ name: 'Carlos Díaz', email: '@dominio.com' });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/email/i);
        });

        it('devuelve 400 cuando el email es "sin-arroba"', async() => {
            const res = await request(app)
                .post('/api/contacts')
                .send({ name: 'Carlos Díaz', email: 'sin-arroba' });

            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/email/i);
        });

        it('devuelve 201 cuando el email tiene formato válido "usuario@dominio.com"', async() => {
            const res = await request(app)
                .post('/api/contacts')
                .send({ name: 'Carlos Díaz', email: 'usuario@dominio.com' });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.email).toBe('usuario@dominio.com');
        });
    });

    describe('Bloque B: POST /api/contacts (Detección de duplicados)', () => {

        it('crear un contacto con un email ya existente devuelve 409', async() => {
            const res = await request(app)
                .post('/api/contacts')
                .send({ name: 'Ana Duplicada', email: 'ana@example.com' });
            expect(res.status).toBe(409);
        });

        it('el body del 409 tiene el campo error con un mensaje descriptivo', async() => {
            const res = await request(app)
                .post('/api/contacts')
                .send({ name: 'Ana Duplicada', email: 'ana@example.com' });

            expect(res.body).toHaveProperty('error');
            expect(typeof res.body.error).toBe('string');
            expect(res.body.error.length).toBeGreaterThan(0);
        });

        it('crear con email en mayúsculas ("ANA@EXAMPLE.COM") cuando ya existe "ana@example.com" también devuelve 409', async() => {
            const res = await request(app)
                .post('/api/contacts')
                .send({ name: 'Ana Mayúsculas', email: 'ANA@EXAMPLE.COM' });

            expect(res.status).toBe(409);
        });

        it('después de recibir un 409, el número total de contactos no aumentó (no-op)', async() => {
            await request(app)
                .post('/api/contacts')
                .send({ name: 'Ana Duplicada', email: 'ana@example.com' });

            const resGet = await request(app).get('/api/contacts');
            expect(resGet.body).toHaveLength(3);
        });
    });

    describe('Bloque C: GET /api/contacts (Query Params)', () => {

        it('?search=ana devuelve solo contactos cuyo nombre o email contiene "ana"', async() => {
            const res = await request(app).get('/api/contacts?search=ana');
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toBe('Ana García');
        });

        it('?search=ANA (mayúsculas) devuelve los mismos resultados (case-insensitive)', async() => {
            const res = await request(app).get('/api/contacts?search=ANA');
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toBe('Ana García');
        });

        it('?search=example filtra por email y devuelve todos los que tienen "@example.com"', async() => {
            const res = await request(app).get('/api/contacts?search=example');
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(3);
        });

        it('?search=xyznoexiste devuelve un array vacío (no un 404)', async() => {
            const res = await request(app).get('/api/contacts?search=xyznoexiste');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(0);
        });

        it('?favorite=true devuelve solo contactos con favorite: true', async() => {
            const res = await request(app).get('/api/contacts?favorite=true');
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toBe('Luis Pérez');
        });

        it('?favorite=true devuelve un array vacío si ninguno es favorito', async() => {
            await request(app).patch('/api/contacts/2/favorite');

            const res = await request(app).get('/api/contacts?favorite=true');
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(0);
        });

        it('sin query params devuelve todos los contactos (comportamiento original)', async() => {
            const res = await request(app).get('/api/contacts');
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(3);
        });
    });

    describe('Bloque D: PATCH /api/contacts/:id/favorite (Toggle)', () => {

        it('llamar PATCH en Ana (ID 1, favorite: false) devuelve el contacto con favorite: true', async() => {
            const res = await request(app).patch('/api/contacts/1/favorite');
            expect(res.status).toBe(200);
            expect(res.body.favorite).toBe(true);
        });

        it('llamarlo dos veces sobre el mismo contacto regresa a favorite: false (toggle completo)', async() => {
            await request(app).patch('/api/contacts/1/favorite');
            const res = await request(app).patch('/api/contacts/1/favorite');
            expect(res.status).toBe(200);
            expect(res.body.favorite).toBe(false);
        });

        it('llamarlo en Luis (ID 2, favorite: true) devuelve el contacto con favorite: false', async() => {
            const res = await request(app).patch('/api/contacts/2/favorite');
            expect(res.status).toBe(200);
            expect(res.body.favorite).toBe(false);
        });

        it('devuelve 404 para un ID inexistente', async() => {
            const res = await request(app).patch('/api/contacts/999/favorite');
            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Contacto no encontrado.');
        });

        it('después del toggle, un GET independiente refleja el cambio persistido', async() => {
            await request(app).patch('/api/contacts/1/favorite');

            const resGet = await request(app).get('/api/contacts/1');
            expect(resGet.status).toBe(200);
            expect(resGet.body.favorite).toBe(true);
        });
    });

    describe('Bloque E: PUT /api/contacts/:id (Actualización Parcial)', () => {

        it('actualizar solo el name devuelve 200 y el contacto con el nombre cambiado', async() => {
            const res = await request(app)
                .put('/api/contacts/1')
                .send({ name: 'Ana de García' });

            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Ana de García');
            expect(res.body.email).toBe('ana@example.com');
        });

        it('intentar actualizar con un email de formato inválido devuelve 400', async() => {
            const res = await request(app)
                .put('/api/contacts/1')
                .send({ email: 'correo-invalido@' });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('El formato del email es inválido.');
        });

        it('intentar actualizar con el email de otro contacto existente devuelve 409', async() => {
            const res = await request(app)
                .put('/api/contacts/1')
                .send({ email: 'luis@example.com' });

            expect(res.status).toBe(409);
            expect(res.body.error).toBe('Ya existe un contacto con ese email.');
        });

        it('actualizar el email con el mismo email del contacto actual devuelve 200 (sin falso positivo)', async() => {
            const res = await request(app)
                .put('/api/contacts/1')
                .send({ email: 'ana@example.com' });
            expect(res.status).toBe(200);
            expect(res.body.email).toBe('ana@example.com');
        });

        it('actualizar un ID inexistente devuelve 404', async() => {
            const res = await request(app)
                .put('/api/contacts/999')
                .send({ name: 'Nadie' });

            expect(res.status).toBe(404);
        });
    });
    describe('Bloque F: Middleware de Error y Uniformidad', () => {

        it('hacer GET /api/ruta-que-no-existe devuelve 404 con Content-Type: application/json', async() => {
            const res = await request(app).get('/api/ruta-que-no-existe');

            expect(res.status).toBe(404);
            expect(res.headers['content-type']).toMatch(/json/);
        });

        it('la respuesta del 404 genérico tiene el campo error en el body (no HTML)', async() => {
            const res = await request(app).get('/api/ruta-que-no-existe');

            expect(res.body).toHaveProperty('error');
            expect(res.body.error).toBe('Ruta no encontrada.');
        });

        it('todos los errores de negocio (400, 404, 409) tienen un campo status con el número correspondiente', async() => {
            const res400 = await request(app).post('/api/contacts').send({ name: '', email: 'valid@mail.com' });
            expect(res400.body).toHaveProperty('status', 400);

            const res404 = await request(app).get('/api/contacts/999');
            expect(res404.body).toHaveProperty('status', 404);

            const res409 = await request(app).post('/api/contacts').send({ name: 'Luis', email: 'luis@example.com' });
            expect(res409.body).toHaveProperty('status', 409);
        });
    });
});