const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'  // ✅ Provide the string model name here
    }]
});

module.exports = mongoose.models.Group || mongoose.model('Group', GroupSchema);

