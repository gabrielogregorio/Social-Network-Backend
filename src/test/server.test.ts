import STATUS_CODE from '@/handlers/index';
import supertest from 'supertest';
import { app, mongoose } from '../app';

const request = supertest(app);

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Testes de aplicação', () => {
  it('A aplicação deve responder', async () => {
    const response = await request.get('/');
    expect(response.statusCode).toEqual(STATUS_CODE.SUCCESS);
  });
});
