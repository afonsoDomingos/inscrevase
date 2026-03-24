const Book = require('../models/Book');
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const pushController = require('./pushController');
const whatsappService = require('../services/whatsappService');
const fs = require('fs');
const path = require('path');

// --- Marketplace & Library ---

exports.recordPurchase = async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user.id;
        
        // Check if already purchased to avoid duplicates
        const existing = await Purchase.findOne({ user: userId, book: bookId });
        if (existing) return res.status(200).json(existing);

        const purchase = new Purchase({
            user: userId,
            book: bookId,
            paymentStatus: 'completed'
        });
        await purchase.save();
        
        // --- Notificar Autor via PUSH (Shopify Style) ---
        try {
            const bookDoc = await Book.findById(bookId);
            if (bookDoc && bookDoc.submittedBy) {
                const mentor = await User.findById(bookDoc.submittedBy);
                
                pushController.sendNotification(
                    bookDoc.submittedBy,
                    "🎉 Nova Venda na Inscreva-se!",
                    `Alguém acabou de comprar "${bookDoc.title}" por $${bookDoc.price || '0'}.`,
                    bookDoc.coverImage,
                    "/dashboard/mentor?tab=mysales"
                );

                // --- WHATSAPP NOTIFICATION ---
                if (mentor && mentor.phone) {
                    const msg = `🎉 *Nova Venda na Inscreva-se!*\n\nOlá ${mentor.name}, alguém acabou de comprar o teu livro "${bookDoc.title}" por $${bookDoc.price}.\n\nAcede à tua dashboard para ver os detalhes. 🚀`;
                    whatsappService.sendMessage(mentor.phone, msg);
                }
            }
        } catch (pushErr) {
            console.error('Erro ao processar notificação push da venda:', pushErr);
        }

        res.status(201).json(purchase);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getUserPurchasedBooks = async (req, res) => {
    try {
        const userId = req.user.id;
        const purchases = await Purchase.find({ user: userId }).populate('book');
        // Return actually the books, not the purchase objects
        const books = purchases.map(p => p.book).filter(b => b !== null);
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMySales = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all books submitted by this user
        const myBooks = await Book.find({ submittedBy: userId });
        const myBookIds = myBooks.map(b => b._id);

        // Find all purchases of those books
        const purchases = await Purchase.find({ book: { $in: myBookIds } })
            .populate('book', 'title coverImage price author')
            .populate('user', 'name email')
            .sort({ purchaseDate: -1 });

        // Build stats per book
        const salesByBook = {};
        let totalRevenue = 0;
        let totalSales = 0;

        purchases.forEach(p => {
            if (!p.book) return;
            const bookId = p.book._id.toString();
            const price = parseFloat(p.book.price || '0');

            if (!salesByBook[bookId]) {
                salesByBook[bookId] = {
                    book: p.book,
                    sales: 0,
                    revenue: 0,
                    buyers: []
                };
            }
            salesByBook[bookId].sales += 1;
            salesByBook[bookId].revenue += price;
            salesByBook[bookId].buyers.push({
                name: p.user?.name || 'Anónimo',
                email: p.user?.email || '',
                date: p.purchaseDate
            });

            totalRevenue += price;
            totalSales += 1;
        });

        res.json({
            totalSales,
            totalRevenue: totalRevenue.toFixed(2),
            salesByBook: Object.values(salesByBook)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Standard Book Controllers ---


exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find({ 
            isActive: true, 
            $or: [
                { status: 'approved' },
                { status: { $exists: false } }
            ] 
        }).sort({ createdAt: -1 });
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
        console.error('[BOOK SUBMIT ERROR]', error);
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
