const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('Client'));

// Helper to read users
async function readUsers() {
    try {
        return await fs.readJson(DATA_FILE);
    } catch (err) {
        return [];
    }
}

// REGISTER
app.post('/api/register', async (req, res) => {
    const { username, privateName, picUrl, password } = req.body;
    const users = await readUsers();

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: "Username already taken" });
    }

    const newUser = { username, privateName, picUrl, password, playlists: [] };
    users.push(newUser);
    await fs.writeJson(DATA_FILE, users);
    res.json({ success: true });
});

// LOGIN
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const users = await readUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

// SAVE DATA (Update user playlists)
app.post('/api/save', async (req, res) => {
    const updatedUser = req.body;
    const users = await readUsers();
    const index = users.findIndex(u => u.username === updatedUser.username);

    if (index !== -1) {
        users[index] = updatedUser;
        await fs.writeJson(DATA_FILE, users);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));