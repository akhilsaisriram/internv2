const express = require('express');
const {
    registerUser,
    loginUser,
    getUsers,
    updateUser,
    deleteUser,
} = require('../controllers/studentController');
const upload = require("../utils/m");

const router = express.Router();

// User registration route
router.post('/register',  upload.single("profilePhoto"),registerUser);

// User login route
router.post('/login', loginUser);

// Get all users 
router.get('/', getUsers);

// Update user by ID
router.put('/:id', upload.single("profilePhoto"), updateUser);

// Delete user by ID
router.delete('/:id', deleteUser);


module.exports = router;
