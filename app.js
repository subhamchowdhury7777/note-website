const express = require('express');
const session = require('express-session');
const path = require('path'); 
const mysql = require('mysql');
const multer = require('multer');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'client/uploads'); // Define uploadDir

// Configure express-session middleware
app.use(session({
    secret: 'secret_key', // Change this to a secure random string
    resave: false,
    saveUninitialized: true
}));

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '#Boss2004',
    database: 'findMyNotes'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));

// Serve static files from the client folder
app.use(express.static(path.join(__dirname, 'client')));

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Use current timestamp as filename
    }
});

const upload = multer({ storage: storage });

// Render home.ejs
app.get('/', (req, res) => {
    const { username } = req.session; // Assuming you're using sessions to manage user authentication

    // Render home.ejs with or without username
    res.render('home', { username: username });
});

// Render cs.ejs
app.get('/cs', (req, res) => {
    const query = 'SELECT * FROM cs';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching CS notes:', error);
            res.status(500).send('Error fetching CS notes');
            return;
        }
        res.render('cs', { notes: results });
    });
});

//Render ce.ejs
app.get("/ce", (req, res) => {
    res.render('ce');
});

// Handle Sign in page
app.get("/signIn", (req, res) => {
    res.render('signIn');
});

// Handle sign up page
app.get('/signUp', (req, res) => {
    res.render('signUp');
});

// Handle registration form submission
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Insert user into MySQL database
    const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
    connection.query(query, [username, password], (error, results, fields) => {
        if (error) {
            console.error('Error registering user:', error);
            res.status(500).send('Error registering user');
            return;
        }
        console.log('User registered successfully');
        res.redirect('/signIn'); // Redirect to sign-in page after successful registration
    });
});

// Handle sign-in request
app.post('/signIn', (req, res) => {
    const { username, password } = req.body;

    // Query the database to find the user with the provided username and password
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    connection.query(query, [username, password], (error, results) => {
        if (error) {
            console.error('Error authenticating user:', error);
            res.status(500).send('Error authenticating user');
            return;
        }

        if (results.length === 1) {
            // Authentication successful
            // Set the username in session
            req.session.username = username;
            // Redirect to home page
            res.redirect('/');
        } else {
            // Authentication failed
            // Redirect back to sign-in page with an error message
            res.redirect('/signIn?error=1');
        }
    });
});

// Handle log out request
app.get('/logout', (req, res) => {
    // Destroy the session to log the user out
    req.session.destroy((err) => {
        if (err) {
            console.error('Error logging out:', err);
            res.status(500).send('Error logging out');
            return;
        }
        // Redirect to home page after logging out
        res.redirect('/');
    });
});

// Handle file upload form submission
app.post('/upload', upload.single('upload'), async (req, res) => {
    const title = req.body.title;
    const filePath = `/uploads/${req.file.filename}`; // Adjusted file path
    
    // Log path for debugging
    console.log('Uploaded file path:', filePath);

    // Insert the uploaded file's details into the database
    const query = `INSERT INTO cs (title, file_path) VALUES (?, ?)`;
    connection.query(query, [title, filePath], (error, results, fields) => {
        if (error) {
            console.error('Error uploading file:', error);
            res.status(500).send('Error uploading file');
            return;
        }
        console.log('File uploaded successfully');
        res.redirect('/cs'); // Redirect to the cs page after successful upload
    });
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
