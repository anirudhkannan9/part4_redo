const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const initialBlogs = [
    {
        title: 'testBlog1',
        author: 'Anirudh',
        url: 'www.testblog1.com',
        likes: 3

    },
    {
        title: 'testBlog2',
        author: 'Anirudh',
        url: 'www.testblog2.com',
        likes: 9
    }

]

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})

test('correct amount of blogs returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(initialBlogs.length)
})

test('blogs are returned as JSON', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/) 
})

afterAll(() => {
    mongoose.connection.close()
  })