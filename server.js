const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());

// Local JSON Database File Path
const DB_FILE = path.join(__dirname, 'database.json');

// Helper to read database
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = { users: [], orders: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
  const data = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(data);
}

// Helper to write database
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// --- API Routes ---

// 1. User Register API (Saves both hashed and plain password for admin)
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const db = readDB();

    const existingUser = db.users.find(u => u.email === email || u.phone === phone);
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email or Phone already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { 
      id: Date.now().toString(), 
      name, 
      email, 
      phone, 
      password: hashedPassword, 
      plainPassword: password, // Saved for direct admin viewing
      createdAt: new Date() 
    };
    
    db.users.push(newUser);
    writeDB(db);

    res.json({ success: true, message: "Registration successful!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. User Login API (Supports Email or Phone)
app.post('/api/login', async (req, res) => {
  try {
    const { loginId, password } = req.body;
    const db = readDB();

    const user = db.users.find(u => u.email === loginId || u.phone === loginId);
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid password!" });
    }

    res.json({ 
      success: true, 
      message: "Login successful", 
      user: { name: user.name, email: user.email, phone: user.phone } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Save Order API
app.post('/api/orders', async (req, res) => {
  try {
    const db = readDB();
    const newOrder = { id: Date.now().toString(), ...req.body, status: 'Verified', createdAt: new Date() };
    
    db.orders.push(newOrder);
    writeDB(db);

    res.json({ success: true, message: "Order saved successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Get Admin All Data API
app.get('/api/admin/all-data', async (req, res) => {
  try {
    const db = readDB();
    const users = [...db.users].reverse();
    const orders = [...db.orders].reverse();
    res.json({ success: true, users, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Local JSON Backend Server running on http://localhost:${PORT}`);
});