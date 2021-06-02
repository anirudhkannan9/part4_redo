const blogsRouter = require('express').Router()
const Blog = require('../models/blog')


blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
        response.json(blog.toJSON())
    } else {
        response.status(404).end()
    } 
})

blogsRouter.post('/', async (request, response) => {
    const body = request.body

    if (body.title === undefined || body.url === undefined) {
        response.send(400).end()
    } else {
        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes === undefined ? 0 : body.likes
        })
    
        const savedBlog = await blog.save()
        response.json(savedBlog)
    }
})

blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndDelete(request.params.id)
    response.sendStatus(204).end()
})
  
module.exports = blogsRouter
