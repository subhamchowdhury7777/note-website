const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the client folder
app.use(express.static(path.join(__dirname, 'client')));

// Render home.ejs
app.get('/', (req, res) => {
    res.render('home');
});

//Render cs.ejs
app.get('/cs', (req, res) => {
    res.render('cs');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
