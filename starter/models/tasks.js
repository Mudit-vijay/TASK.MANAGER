const mongoose = require('mongoose')
const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'must provide name'],
        trim: true,
        maxlength: [20, 'name cant be more then 20  characters']
    },
    completed: {
        type: Boolean,
        default: false,
    }
})
module.exports = mongoose.model('Task', TaskSchema)
// Why Not Directly Export the Schema?
// Exporting the schema directly (TaskSchema) would only give you the schema definition.
// It wouldn’t allow you to interact with the MongoDB collection, because the schema itself doesn’t provide methods like
//.find(), .create(), .update(), etc.
// The model (Task) is what provides these methods,
//and that’s what you need in your application to perform database operations.