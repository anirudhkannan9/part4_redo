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
        author: 'Anirudh Also',
        url: 'www.testblogTWO.ORG',
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

test('id property of blog posts is defined as per toJSON method', async () => {
    const result = await api.get('/api/blogs')

    expect(result.body[0].id).toBeDefined()
    expect(result.body[1].id).toBeDefined()
})

test('posting works correctly', async () => {
    const blogObject = {
        title: 'new blog to test that posting works',
        author: 'Anirudh poster',
        url: 'www.testblogPOST.xyz',
        likes: 8
    }

    let postResponse = await api.post('/api/blogs').send(blogObject).expect(200).expect('Content-Type', /application\/json/)
    postResponse = postResponse.body
    expect(postResponse.title).toEqual('new blog to test that posting works')
    expect(postResponse.author).toEqual('Anirudh poster')
    expect(postResponse.url).toEqual('www.testblogPOST.xyz')
    expect(postResponse.likes).toEqual(8)

    let getResponse = await api.get('/api/blogs')
    getResponse = getResponse.body
    expect(getResponse.length).toEqual(initialBlogs.length + 1) 
    const newBlog = getResponse[2]
    expect(newBlog.title).toEqual('new blog to test that posting works')
    expect(newBlog.author).toEqual('Anirudh poster')
    expect(newBlog.url).toEqual('www.testblogPOST.xyz')
    expect(newBlog.likes).toEqual(8)
})

test('correct behaviour for missing likes property', async () => {
    const blogObject = {
        title: 'new blog to test correct behaviour if likes property missing',
        author: 'Anirudh poster no likes',
        url: 'www.testblogpostNOLIKES.zerolikes'
    }

    let postResponse = await api.post('/api/blogs').send(blogObject).expect(200).expect('Content-Type', /application\/json/)
    postResponse = postResponse.body
    expect(postResponse.title).toEqual('new blog to test correct behaviour if likes property missing')
    expect(postResponse.author).toEqual('Anirudh poster no likes')
    expect(postResponse.url).toEqual('www.testblogpostNOLIKES.zerolikes')
    expect(postResponse.likes).toEqual(0)
    

})

afterAll(() => {
    mongoose.connection.close()
  })