require('dotenv').config();
const mongoose = require('mongoose');
const PersonalTask = require('./src/models/PersonalTask');

async function test() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const taskData = {
            user: new mongoose.Types.ObjectId(), // Fake user ID
            title: "Cobranca: NutriHelp Hospegamem 6 Meses",
            description: "",
            priority: "medium",
            deadline: "2026-04-25"
        };
        
        // Simulating the controller logic
        const project = "";
        if (project) taskData.project = project;

        console.log('Task data before save:', taskData);

        const task = new PersonalTask(taskData);
        await task.save();
        console.log('Task saved successfully:', task);

        // cleanup
        await PersonalTask.deleteOne({ _id: task._id });

    } catch (err) {
        console.error('Error saving task:', err);
    } finally {
        mongoose.connection.close();
    }
}

test();
