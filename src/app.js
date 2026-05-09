require('dotenv').config();

const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const session = require('express-session');

require('./config/supabase'); // Initialize Supabase
const route = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
const publicDir = path.join(__dirname, '..', 'public');
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

app.use(express.static(publicDir));
app.use('/uploads', express.static(uploadsDir));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
        secret: 'hoangvu',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 },
    }),
);
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// handlebars
app.engine(
    '.hbs',
    engine({
        extname: '.hbs',
        layoutsDir: path.join(__dirname, 'views/layouts'),
        partialsDir: path.join(__dirname, 'views/partials'),
        defaultLayout: 'main',

        helpers: {
            json: (x) => JSON.stringify(x),
            eq: (a, b) => a === b,
            ne: (a, b) => a !== b,
            formatPrice: (v) => v.toLocaleString(),
            multiply: (a, b) => a * b,
            formatDate: (date) => {
                if (!date) return '';
                return new Date(date).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                });
            },
            formatNumber: (num) => {
                if (!num && num !== 0) return '';
                return Number(num).toLocaleString('vi-VN');
            },
        },
    }),
);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

route(app);

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
