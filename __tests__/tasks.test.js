import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import jwt from 'jsonwebtoken';

describe('Task Routes', () => {
  let userId;
  let token;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      name: 'Task Test User',
      email: 'tasktest@example.com',
      password: 'password123',
    });
    userId = user._id;
    token = jwt.sign({ userId }, process.env.JWT_SECRET);

    // Clear tasks collection
    await Task.deleteMany({});
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
          priority: 'high',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('title', 'Test Task');
    });

    it('should require authentication', async () => {
      const res = await request(app).post('/api/tasks').send({
        title: 'Unauthorized Task',
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/tasks', () => {
    it('should get all user tasks', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should filter tasks by status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=todo')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      res.body.forEach((task) => {
        expect(task.status).toBe('todo');
      });
    });
  });
});
