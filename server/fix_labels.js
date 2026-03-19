const mongoose = require('mongoose');
require('dotenv').config();
const Form = require('./src/models/Form');

async function checkCorrupted() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const forms = await Form.find({ 
            'fields.label': { 
                $in: ['events.defaultFieldPhone', 'events.defaultFieldName', 'events.defaultFieldEmail'] 
            } 
        });
        console.log(`Found ${forms.length} corrupted forms`);
        
        if (forms.length > 0) {
            console.log('Sample Corrupted Slug:', forms[0].slug);
            
            // Migration: Correct the labels
            let totalUpdated = 0;
            for (const form of forms) {
                let updated = false;
                form.fields = form.fields.map(f => {
                    if (f.label === 'events.defaultFieldPhone') {
                        f.label = 'Telemóvel / WhatsApp';
                        updated = true;
                    } else if (f.label === 'events.defaultFieldName') {
                        f.label = 'Nome Completo';
                        updated = true;
                    } else if (f.label === 'events.defaultFieldEmail') {
                        f.label = 'Email';
                        updated = true;
                    }
                    return f;
                });
                
                if (updated) {
                    await form.save();
                    totalUpdated++;
                }
            }
            console.log(`Migrated ${totalUpdated} forms to readable labels.`);
        }
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
    }
}

checkCorrupted();
