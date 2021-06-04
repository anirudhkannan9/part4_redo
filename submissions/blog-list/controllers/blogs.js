const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
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

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}

blogsRouter.post('/', async (request, response) => {
    const body = request.body
    const token = getTokenFrom(request)

    const decodedToken = jwt.verify(token, process.env.SECRET)
    //diverges slightly from course material to allow specificity in error msgs
    if (!token) {
        return response.status(401).json({ error: 'token missing' })
    } else if (!decodedToken.id) {
        return response.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id)

    if (body.title === undefined || body.url === undefined) {
        response.send(400).end()
    } else {
       
        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes === undefined ? 0 : body.likes,
            user: user._id
        })
    
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()

        response.json(savedBlog)
    }
})

blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndDelete(request.params.id)
    response.sendStatus(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body
    const oldBlog = await Blog.findById(request.params.id)
    if (!oldBlog) {
        response.sendStatus(400).end()
    } else {
        //DO NOT USE MONGOOSE SCHEMA OBJECT HERE i.e. no newBlog = new Blog({title: ...}) -- fails to update. Apparently normal JS objects are not only preferred but necessary
        const newBlog = {
            title: oldBlog.title, 
            author: oldBlog.author,
            url: oldBlog.url,
            likes: body.likes === undefined ? oldBlog.likes : body.likes
        }
    
        const resultUpdatedBlog = await Blog.findByIdAndUpdate(request.params.id, newBlog, { new: true })
        //output of this next line doesn't change if we do response.json(resultUpdatedBlog) as opposed to resultUpdatedBlog.toJSON(). Maybe .json(object) calls object's .toJSON() method
        response.json(resultUpdatedBlog.toJSON())
    }
})
  
module.exports = blogsRouter
