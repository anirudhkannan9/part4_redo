
const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./blog_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')


beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})

describe('when there are some initial blogs saved', () => {
    test('blogs are returned as JSON', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/) 
    })

    test('correct amount of blogs (all blogs) returned', async () => {
        const response = await api.get('/api/blogs')
    
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    //specific blog is within returned blogs
    test('specific blog is within returned blogs', async () => {
        const response = await api.get('/api/blogs')
        const contents = response.body.map(r => r.title)
        expect(contents).toContain(
            'testBlog2'
        )

    })
})

describe('viewing a specific blog', () => {
    test('succeeds with a valid id', async () => {
        const blogsAtStart = await helper.blogsInDb()

        const blogToView = blogsAtStart[0]

        const resultBlog = await api
            .get(`/api/blogs/${blogToView.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const processedBlogToView = JSON.parse(JSON.stringify(blogToView))

        expect(resultBlog.body).toEqual(processedBlogToView)


    })

    // eslint-disable-next-line quotes
    test("fails w statuscode 404 if blog doesn't exist", async () => {
        const validNonExistingId = await helper.nonExistingId()

        await api
            .get(`/api/blogs/${validNonExistingId}`)
            .expect(404)
    })
})

describe('addition of a new blog', () => {
    //succeeds w valid data
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
        expect(getResponse.length).toEqual(helper.initialBlogs.length + 1) 
        const newBlog = getResponse[2]
        expect(newBlog.title).toEqual('new blog to test that posting works')
        expect(newBlog.author).toEqual('Anirudh poster')
        expect(newBlog.url).toEqual('www.testblogPOST.xyz')
        expect(newBlog.likes).toEqual(8)
    })

    //fails w statuscode 400 if data invalid
    test('fails w statuscode 400 if data invalid (missing title or url)', async () => {
        const blogObject1 = {
            title: 'new blog to test correct behaviour if no url',
            author: 'Anirudh poster no url',
            likes: 1
        }
    
        await api.post('/api/blogs').send(blogObject1).expect(400)
    
        const blogObject2 = {
            url: 'www.testblogpostNOTITLE.abc',
            author: 'Anirudh poster no title',
            likes: 2
        }
    
        await api.post('/api/blogs').send(blogObject2).expect(400)
    
        let getResponse = await api.get('/api/blogs')
        getResponse = getResponse.body
        expect(getResponse.length).toEqual(helper.initialBlogs.length)
    
    })

    test('id property of blog posts is defined as per toJSON method', async () => {
        const result = await api.get('/api/blogs')
    
        expect(result.body[0].id).toBeDefined()
        expect(result.body[1].id).toBeDefined()
    })

    test('succeeds w statuscode 200 if likes property missing and other data valid', async () => {
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
    
})

describe('deletion of a blog', () => {
    test('succeeds w statuscode 204 if id valid', async () => {
        const blogsInDb = await helper.blogsInDb()
        
        const blogToDelete = blogsInDb[1]
        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(204)
        
        const blogsInDbAfterDelete = await helper.blogsInDb()
        expect(blogsInDbAfterDelete.length).toEqual(blogsInDb.length - 1)
        const blogTitlesAfterDelete = blogsInDbAfterDelete.map(b => b.title)
        expect(blogTitlesAfterDelete).toContain(blogsInDb[0].title)
        expect(blogTitlesAfterDelete).not.toContain(blogsInDb[1].title)
    })
})

describe('updating a blog', () => {

    test('updating only likes of blog with valid id succeeds', async () => {
        const oldBlogs = await helper.blogsInDb()

        //get object we're trying to update
        const oldBlog = oldBlogs[0]

        //create new object
        const newBlog = {
            title: oldBlog.title,
            author: oldBlog.author,
            url: oldBlog.url,
            likes: 7
        }

        //send
        let updatedBlog = await api.put(`/api/blogs/${oldBlog.id}`).send(newBlog)
        updatedBlog = updatedBlog.body

        //check same amount of blogs, same other properties, different likes property
        const newBlogs = await helper.blogsInDb()
        //console.log('OLD BLOGS: ', oldBlogs)
        console.log('\n\n\n UPDATED BLOG', updatedBlog)
        //console.log('\n\n\n NEW BLOGS', newBlogs)
        expect(newBlogs.length).toEqual(oldBlogs.length)
        expect(newBlogs[0].title).toEqual(oldBlog.title)
        expect(newBlogs[0].author).toEqual(oldBlog.author)
        expect(newBlogs[0].url).toEqual(oldBlog.url)
        expect(newBlogs[0].likes).toEqual(7)
        expect(updatedBlog.title).toEqual(oldBlog.title)
        expect(updatedBlog.author).toEqual(oldBlog.author)
        expect(updatedBlog.url).toEqual(oldBlog.url)
        expect(updatedBlog.likes).toEqual(7) 


    })

    test('updating with nonexistent id fails w statuscode 400', async () => {
        const validNonExistingId = await helper.nonExistingId()

        const newBlog = {
            likes: 1000
        }

        await api.put(`/api/blogs/${validNonExistingId}`).send(newBlog).expect(400)

    })

})

afterAll(() => {
    mongoose.connection.close()
  })