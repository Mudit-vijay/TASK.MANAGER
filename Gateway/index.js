const cors = require('cors');
const express = require('express');
const app = express();
const login = require('./controllers/login.js');
const tasks = require('./controllers/tasks.js')
const group = require('./controllers/group.js')

app.use(cors({
    origin: 'https://task-manager-1-5jlg.onrender.com',
    credentials: true,
}));

app.use(express.json());

app.use('/api/v1', login);
app.use('/api/v1', tasks);
app.use('/api/v1', group);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`);
});


