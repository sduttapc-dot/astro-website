const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// মিডলওয়্যার (Middleware)
app.use(cors());
app.use(express.json());

// ফ্রন্টএন্ডের সমস্ত HTML, CSS ও JS ফাইলগুলোর জন্য স্ট্যাটিক ফোল্ডার পাথ সেট করা
app.use(express.static(path.join(__dirname)));

// ১. রুট রাউট (হোম পেজ ওপেন করার জন্য)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ডেটাবেজ ফাইল চেক বা রিড করার ফাংশন
const DB_FILE = path.join(__dirname, 'database.json');

if (!fs.existsSync(DB_FILE)) {
  const initialData = { users: [], orders: [] };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// ২. ইউজার রেজিস্ট্রেশন API
app.post('/api/register', (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

    // চেক করা ইউজার আগে থেকেই আছে কি না
    const existingUser = data.users.find(u => u.email === email || u.phone === phone);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or phone already exists!' });
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      phone,
      plainPassword: password, // আপনার প্রয়োজন অনুযায়ী পাসওয়ার্ড সেভ হচ্ছে
      regDate: new Date().toLocaleDateString()
    };

    data.users.push(newUser);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

    res.status(201).json({ message: 'Registration successful!', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ৩. ইউজার লগইন API
app.post('/api/login', (req, res) => {
  try {
    const { loginId, password } = req.body; // loginId হতে পারে email বা phone
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

    const user = data.users.find(u => (u.email === loginId || u.phone === loginId) && u.plainPassword === password);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email/phone or password!' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ৪. কনসালটেশন বা সার্ভিস অর্ডার সেভ করার API
app.post('/api/orders', (req, res) => {
  try {
    const orderData = req.body;
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

    const newOrder = {
      id: Date.now(),
      ...orderData,
      date: new Date().toLocaleString()
    };

    if (!data.orders) {
      data.orders = [];
    }

    data.orders.push(newOrder);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

    res.status(201).json({ message: 'Order saved successfully!', order: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while saving order' });
  }
});

// ৫. অ্যাডমিন ড্যাশবোর্ডের জন্য সমস্ত ডাটা ফেচ করার API
app.get('/api/admin/all-data', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    res.status(200).json({
      users: data.users || [],
      orders: data.orders || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching admin data' });
  }
});

// সার্ভার স্টার্ট করা
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});