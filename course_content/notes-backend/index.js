//primary purpose of backend server in this course is to serve raw data (JSON format) to the frontend


//imports Node's built-in web server module (CommonJS module; functions similarly to ES6 modules)
//code that runs in the browser uses ES6 modules
const http = require('http')

//using environment variables defined in .env file. Important to import this before Note model, so env variables are available globally before other modules (that use them) are imported
require('dotenv').config()

//imports Express, a library that makes it easier to work with Node's built-in web server module, which is cumbersome to scale
const express = require('express')

//rn, express is a function that is used to create the application that is stored in the app variable
const app = express()

//import Note module (model for Note)
const Note = require('./models/note')

const cors = require('cors')
app.use(cors())

//Whenever express gets a GET request it first checks in the build folder for a file corresponding to the address, and returns it
app.use(express.static('build'))

//app use express json-parser to access JSON data sent to our endpoints
app.use(express.json())

//define middleware that prints info re: every request sent to the server
const requestLogger = (request, response, next) => {
  console.log('Method: ', request.method)
  console.log('Path: ', request.path)
  console.log('Body: ', request.body)
  next()
}

//use middleware
app.use(requestLogger)


let notes = [
    {
      id: 1,
      content: "HTML is easy",
      date: "2019-05-30T17:30:31.098Z",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only Javascript",
      date: "2019-05-30T18:39:34.091Z",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      date: "2019-05-30T19:20:14.298Z",
      important: true
    }
  ]

//routes: 

//event handler that handles GET requests to http://localhost:3001; first param contains details of HTTP request, 2nd param defines how request is responded to 
app.get('/', (request, response) => {
    //since response.send param is string, express automatically sets content-type to be html
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  Note
    .find({})
    .then(notes => {
      response.json(notes)
    })
})

//expanding application so it offers a REST interface to operate on individual notes

app.get('/api/notes/:id', (request, response, next) => {
  Note
    .findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
    
})

app.post('/api/notes', (request, response, next) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date()
  })

  note
    .save()
    .then(savedNote => savedNote.toJSON())
    .then(savedAndFormattedNote => {
      response.json(savedAndFormattedNote)
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
  Note 
    .findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('api/notes/:id', (request, response, next) => {
  const body = request.body

  //not using Note constructor because findByIdAndUpdate receives a regular JS object
  const note = {
    content: body.content,
    important: body.important
  }

  Note
    .findByIdAndUpdate(request.params.id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))

  
    
})


//define + use middleware for catching requests made to unknown endpoints:
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

//Express error handlers are middleware defined as functions with four parameters
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id'})
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

//has to be the last loaded middleware
app.use(errorHandler)


//binds server to app variable; listens to HTTP requests made at this port (3001)
const PORT = process.env.PORT
app.listen(PORT)
console.log(`server running on ${PORT}`)