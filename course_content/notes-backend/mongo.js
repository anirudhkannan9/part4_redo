//practice application for playing with MongoDB in this new file

//instead of using official MongoDB Node.js driver library, using Mongoose library that offers 'higher level API'
//Mongoose can be thought of as a 'object document mapper' (ODM); this library facilitates saving JS objects as Mongo documents
const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.22slg.mongodb.net/note-app?retryWrites=true&w=majority`

//establish connection to the database (name specified in URI; the database we're connecting to is 'note-app')
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true})

//define schema for a note and matching model
const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean
})

const Note = mongoose.model('Note', noteSchema)

// const note1 = new Note({
//     content: 'HTML is easy',
//     date: new Date(),
//     important: true
// })

// const note2 = new Note({
//     content: 'Mongoose makes use of Mongo easy',
//     date: new Date(),
//     important: true
// })

// const note3 = new Note({
//     content: 'Callback functions suck',
//     date: new Date(),
//     important: true
// })

// note1
// .save()
// .then(result => {
//     console.log('note1 saved!')
//     note2
//     .save()
//     .then(result => {
//         console.log('note2 saved!')
//         note3
//         .save()
//         .then(result => {
//             console.log('note3 saved!')
//             //if connection isn't closed program never finishes its execution
//             mongoose.connection.close()
//         })

//     })
// })

Note
.find({ important: true })
.then(result => {
    result.forEach(note => {
        console.log(note)
    })
    mongoose.connection.close()
})