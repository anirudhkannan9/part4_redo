const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
        return sum + item
    }

    return blogs.map(blog => blog.likes).reduce(reducer, 0)

}

const favoriteBlog = (blogs) => {
    let favouriteBlog = blogs[0]

    for (let i=0; i < blogs.length; i++) {
        if (blogs[i].likes > favouriteBlog.likes) {
            favouriteBlog = blogs[i]
        }
    }

    return favouriteBlog
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}