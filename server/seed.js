const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB to seed users...');

        // Clear existing users for a clean start (optional)
        await User.deleteMany({});

        const users = [
            {
                name: 'Super Administrador',
                email: 'superadmin@inscrevase.com',
                password: '@SuprAdmin123@',
                role: 'SuperAdmin',
                businessName: 'Inscreva-se Global'
            },
            {
                name: 'Administrador Geral',
                email: 'admin@inscrevase.com',
                password: '@Admin123@',
                role: 'admin',
                businessName: 'Inscreva-se Corporate'
            },
            {
                name: 'Celso de Oliveira',
                email: 'celso.mentor@example.com',
                password: 'mentor123@password',
                role: 'mentor',
                businessName: 'Oliveira Mentoria & Coaching',
                bio: 'Especialista em desenvolvimento de liderança em Moçambique.',
                whatsapp: '+258840000000'
            },
            {
                name: 'Sofia Mucavele',
                email: 'sofia.palestrante@example.com',
                password: 'mentor123@password',
                role: 'mentor',
                businessName: 'Mucavele Events',
                bio: 'Palestrante internacional focada em branding de luxo.',
                whatsapp: '+258820000000'
            }
        ];

        for (const u of users) {
            try {
                const user = new User(u);
                await user.save();
                console.log(`User created: ${u.name} (${u.role})`);
            } catch (saveErr) {
                console.error(`Failed to create user ${u.name}:`, saveErr.message);
            }
        }

        console.log('Seeding process finished!');
        process.exit();
    } catch (err) {
        console.error('Error in seeding script:', err);
        process.exit(1);
    }
};

seedUsers();
