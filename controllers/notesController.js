import Note from "../models/Note.js";
import asyncHandler from "express-async-handler";

// @desc Get all notes
// @route GET /notes
// @access Private
export const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find().populate('user', "username").lean();
    if (!notes?.length) {
        return res.status(400).json({ message: 'No notes found' });
    }
    res.json(notes);
});

// @desc Create new note
// @route POST /notes
// @access Private
export const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body

    if (!user || !title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const duplicate = await Note.findOne({ title }).lean().exec()
    console.log('duplicate: ', duplicate);

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    const note = new Note({
        user,
        title,
        text
    });
    
    console.log('note: ', note);
    const savedNote = await note.save();
    console.log('savedNote: ', savedNote);

    if (savedNote) {
        return res.status(201).json({ message: 'New note created' })
    } else {
        return res.status(400).json({ message: 'Invalid note data received' })
    }
});

// @desc Update a note
// @route PATCH /notes
// @access Private
export const updateNote = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body

    // Confirm data
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Confirm note exists to update
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).lean().exec()

    // Allow renaming of the original note 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()

    res.json(`'${updatedNote.title}' updated`)
});

// @desc Delete a note
// @route DELETE /notes
// @access Private
export const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Note ID required' })
    }

    // Confirm note exists to delete 
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    const result = await note.deleteOne()

    const reply = `Note '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
});
