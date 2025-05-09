const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

const tasksRouter = require('./src/routes/tasks');
const authRouter = require('./src/routes/auth');
const dashboardRouter = require('./src/routes/dashboard');

// Middleware to parse incoming requests
// Serve static files (HTML, CSS, JS) from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/tasks', tasksRouter);
app.use('/auth', authRouter);
app.use('/dashboard', dashboardRouter)
app.all('/{*any}', (req, res) => {
    res.redirect('/dashboard');
});


console.log(`
  _______        _      _   _           _   
 |__   __|      | |    | \\ | |         | |  
    | | __ _ ___| | __ |  \\| | ___  ___| |_ 
    | |/ _\` / __| |/ / | . \` |/ _ \\/ __| __|
    | | (_| \\__ \\   <  | |\\  |  __/\\__ \\ |_ 
    |_|\\__,_|___/_|\\_\\ |_| \\_|\\___||___/\\__|
    by Voxny404
`);
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
