const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../app');
const { User } = require('../models/user');

const { PORT = 3000, DB_HOST_TEST } = process.env;

describe('Test /users/login route', () => {
  let server = null;

  beforeAll(async () => {
    server = app.listen(PORT);
    await mongoose.connect(DB_HOST_TEST);
  });

  afterAll(async () => {
    server.close();
    await mongoose.connection.close();
  });

  test('Login route with valid user data', async () => {
    const validCredentials = {
      email: 'test@gmail.com',
      password: 'qwerty123',
    };

    const res = await request(app).post('/users/login').send(validCredentials);

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user).toEqual({
      email: expect.stringMatching(validCredentials.email),
      subscription: expect.stringMatching(/^(starter|pro|business)$/),
    });

    const user = await User.findOne({ email: validCredentials.email });
    expect(user.token).toBe(res.body.token);
  });

  test('Login route with wrong user data', async () => {
    const invalidCredentials = {
      email: 'nonexistentuser@gmail.com',
      password: 'wrongpassword',
    };

    const resWithError = await request(app)
      .post('/users/login')
      .send(invalidCredentials);

    expect(resWithError.statusCode).toBe(401);
    expect(resWithError.body.message).toBe('Email or password is wrong');
  });
});
