const Blog = require('../models/blog')
const User = require('../models/user')

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

const nonExistingId = async () => {
    const blog = new Blog({ title: 'x', author: 'x', url: 'abc.com', likes: 0})
    await blog.save()
    await blog.remove()

    return blog._id.toString()
}

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(b => b.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = {
    initialBlogs,
    nonExistingId,
    blogsInDb,
    usersInDb
}