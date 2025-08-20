const connectdb = require('./db/connect')
const express = require('express')
const cors = require('cors')
const app = express();
const group = require('./routes/groups')
const task = require('./routes/task')
// const notFOund = require('./middleware/error-handler')
require('dotenv').config()
app.use(cors({
    origin: ['https://gateway-abwx.onrender.com'],
    credentials: true
}))
//middleware
app.use(express.static('./public'))
app.use(express.json())
app.use('/api/v1/task', task);
app.use('/api/v1/group', group);
// app.use(notFOund)
const start = async () => {
    try {
        await connectdb(process.env.MONGO_URI)
        app.listen(3000, () => {
            console.log("server is listening on port 3000");

        })
    } catch (err) {
        console.log(err);

    }
}
start()
