import express from "express";
import { getAllNotes, createNewNote, updateNote, deleteNote } from "../controllers/notesController.js";
const router = express.Router();
import verifyJWT from "../middleware/verifyJWT.js";

router.use(verifyJWT);

router.route('/')
    .get(getAllNotes)
    .post(createNewNote)
    .patch(updateNote)
    .delete(deleteNote)

export default router;