const Book = require('../models/Book');

exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find({ isActive: true, status: 'approved' }).sort({ createdAt: -1 });
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.adminGetAllBooks = async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createBook = async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(book);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Livro removido com sucesso' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.recordClick = async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } }, { new: true });
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// USER: Submit their own book
exports.submitBook = async (req, res) => {
    try {
        const bookData = {
            ...req.body,
            submittedBy: req.user.id,
            isUserSubmission: true,
            status: 'pending' // Enforced for users
        };
        const book = new Book(bookData);
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// USER: Get their own submissions
exports.getMyBooks = async (req, res) => {
    try {
        const books = await Book.find({ submittedBy: req.user.id }).sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ADMIN: Approve/Reject submission
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const book = await Book.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
