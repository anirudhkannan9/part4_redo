//instead of using official MongoDB Node.js driver library, using Mongoose library that offers 'higher level API'
//Mongoose can be thought of as a 'object document mapper' (ODM); this library facilitates saving JS objects as Mongo documents
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)


//establish connection to the database (name specified in URI; the database we're connecting to is 'note-app')
mongoose
    .connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true})
    .then(result => {
        console.log('Connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB', error.message)
    })


//define schema for a note and matching model
const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        minlength: 5,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    important: Boolean
})

//adjust toJSON method of Note so that __v is deleted, _id is made into a String instead of an Object
noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

module.exports = mongoose.model('Note', noteSchema)
  