//event handlers related to routes ('controllers') moved into this dedicated module. This file contains all routes related to notes.

//creating a router object; a middleware used to define 'related routes' in a single place (module), that can be exported & used by other modules
const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', async (request, response) => {
    const notes = await Note.find({})
    response.json(notes)
})

notesRouter.post('/', async (request, response) => {
    const body = request.body

    const note = new Note({
        content: body.content,
        important: body.important === undefined ? false : body.important,
        date: new Date()
    })

    const savedNote = await note.save()
    response.json(savedNote.toJSON())
})


notesRouter.get('/:id', async (request, response) => {
    const note = await Note.findById(request.params.id)
    if (note) {
        response.json(note.toJSON())
    } else {
        response.status(404).end()
    } o
})

notesRouter.delete('/:id', async (request, response) => {
    await Note.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

notesRouter.put('/:id', (request, response, next) => {
    body = request.body

    note = {
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

module.exports = notesRouter