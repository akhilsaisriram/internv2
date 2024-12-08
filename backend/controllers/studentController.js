const bcrypt = require("bcrypt");
const { readData, writeData } = require("../utils/fsUtils");
const {
    validateNameAndPhone,
    validateDob,
    validateClass,
    validateFeePaid,
    validateEmail,
} = require("./validation");

// const registerUser = async (req, res) => {
//     const { username, password, profilePhoto, phone, dob, studentClass, name } = req.body;

//     // Validate user inputs
//     const nameAndPhoneValidation = validateNameAndPhone(name, phone);
//     if (!nameAndPhoneValidation.isValid) {
//         return res.status(400).json({ message: nameAndPhoneValidation.message });
//     }

//     const dobValidation = validateDob(dob);
//     if (!dobValidation.isValid) {
//         return res.status(400).json({ message: dobValidation.message });
//     }

//     const classValidation = validateClass(studentClass);
//     if (!classValidation.isValid) {
//         return res.status(400).json({ message: classValidation.message });
//     }

//     const emailValidation = validateEmail(username);
//     if (!emailValidation.isValid) {
//         return res.status(400).json({ message: emailValidation.message });
//     }

//     const users = readData();

//     // Check if user already exists
//     const existingUser = users.find((user) => user.username === username );
//     if (existingUser) {
//         return res.status(409).json({ message: "User with this username  already exists" });
//     }

//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);

//         const newUser = {
//             _id: Date.now().toString(),
//             username,
//             password: hashedPassword,
//             profilePhoto,
//             phone,
//             dob,
//             studentClass,
//             name,
            
//         };

//         users.push(newUser);
//         writeData(users);

//         res.status(201).json({ message: "User registered successfully", user: newUser });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
const registerUser = async (req, res) => {
    const { username, password, phone, dob, studentClass, name } = req.body;
    const profilePhoto = req.file ? req.file.path : null; // Get file path if uploaded

    // Validate user inputs
    const nameAndPhoneValidation = validateNameAndPhone(name, phone);
    if (!nameAndPhoneValidation.isValid) {
        return res.status(400).json({ message: nameAndPhoneValidation.message });
    }

    const dobValidation = validateDob(dob);
    if (!dobValidation.isValid) {
        return res.status(400).json({ message: dobValidation.message });
    }

    const classValidation = validateClass(studentClass);
    if (!classValidation.isValid) {
        return res.status(400).json({ message: classValidation.message });
    }

    const emailValidation = validateEmail(username);
    if (!emailValidation.isValid) {
        return res.status(400).json({ message: emailValidation.message });
    }

    const users = readData();

    // Check if user already exists
    const existingUser = users.find((user) => user.username === username);
    if (existingUser) {
        return res.status(409).json({ message: "User with this username already exists" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            _id: Date.now().toString(),
            username,
            password: hashedPassword,
            profilePhoto,
            phone,
            dob,
            studentClass,
            name,
        };

        users.push(newUser);
        writeData(users);

        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const loginUser = async (req, res) => {
    const { username, password } = req.body;

    const users = readData();
    const user = users.find((u) => u.username === username);
    if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    res.status(200).json({ message: "Login successful", token: user.username });
};


// const getUsers = (req, res) => {
//     const { page = 1 } = req.query; // Default to page 1 if no page parameter is provided
//     const usersPerPage = 4; // Define how many users to send per page

//     const users = readData().map(({ password, ...rest }) => rest); // Exclude passwords

//     if (users.length === 0) {
//         return res.status(204).json({ message: "No users found" });
//     }

//     const totalUsers = users.length;
//     const totalPages = Math.ceil(totalUsers / usersPerPage);

//     if (page < 1 || page > totalPages) {
//         return res.status(400).json({ message: "Invalid page number" });
//     }

//     const startIndex = (page - 1) * usersPerPage;
//     const paginatedUsers = users.slice(startIndex, startIndex + usersPerPage);

//     res.status(200).json({
//         totalUsers,
//         totalPages,
//         currentPage: parseInt(page, 10),
//         users: paginatedUsers,
//     });
// };
const fs = require('fs');

const getUsers = (req, res) => {
    const { page = 1 } = req.query; // Default to page 1 if no page parameter is provided
    const usersPerPage = 3; // Define how many users to send per page

    const users = readData().map(({ password, profilePhoto, ...rest }) => {
        let processedProfilePhoto = profilePhoto;

        if (profilePhoto && !profilePhoto.startsWith('data:image')) {
            // Convert file path to Base64 if not already in Base64 format
            try {
                const fileData = fs.readFileSync(profilePhoto);
                const mimeType = 'image/jpeg'; // Replace with correct MIME type if necessary
                processedProfilePhoto = `data:${mimeType};base64,${fileData.toString('base64')}`;
            } catch (error) {
                console.error(`Error reading profile photo for user: ${error.message}`);
            }
        }

        return {
            ...rest,
            profilePhoto: processedProfilePhoto,
        };
    }); // Exclude passwords and process profile photo

    if (users.length === 0) {
        return res.status(204).json({ message: "No users found" });
    }

    const totalUsers = users.length;
    const totalPages = Math.ceil(totalUsers / usersPerPage);

    if (page < 1 || page > totalPages) {
        return res.status(400).json({ message: "Invalid page number" });
    }

    const startIndex = (page - 1) * usersPerPage;
    const paginatedUsers = users.slice(startIndex, startIndex + usersPerPage);

    res.status(200).json({
        totalUsers,
        totalPages,
        currentPage: parseInt(page, 10),
        users: paginatedUsers,
    });
};

// const updateUser = async (req, res) => {
//     const { id } = req.params;
//     const { username, password, profilePhoto, phone, dob, studentClass, name } = req.body;

//      // Validate user inputs
//      const nameAndPhoneValidation = validateNameAndPhone(name, phone);
//      if (!nameAndPhoneValidation.isValid) {
//          return res.status(400).json({ message: nameAndPhoneValidation.message });
//      }
 
//      const dobValidation = validateDob(dob);
//      if (!dobValidation.isValid) {
//          return res.status(400).json({ message: dobValidation.message });
//      }
 
//      const classValidation = validateClass(studentClass);
//      if (!classValidation.isValid) {
//          return res.status(400).json({ message: classValidation.message });
//      }
 
//      const emailValidation = validateEmail(username);
//      if (!emailValidation.isValid) {
//          return res.status(400).json({ message: emailValidation.message });
//      }
 

     
//     const users = readData();
//     const userIndex = users.findIndex((user) => user._id === id);
//     if (userIndex === -1) {
//         return res.status(404).json({ message: "User not found" });
//     }


//     const updatedUser = { ...users[userIndex] };
//     if (username) updatedUser.username = username;
//     if (password) updatedUser.password = await bcrypt.hash(password, 10);
//     if (profilePhoto) updatedUser.profilePhoto = profilePhoto;
//     if (phone) updatedUser.phone = phone;
//     if (dob) updatedUser.dob = dob;
//     if (studentClass) updatedUser.studentClass = studentClass;
//     if (name) updatedUser.name = name;

//     users[userIndex] = updatedUser;
//     writeData(users);
//     const { password: _, ...userWithoutPassword } = updatedUser;

//     res.status(200).json(userWithoutPassword);
// };
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, password, phone, dob, studentClass, name } = req.body;
    const profilePhoto = req.file ? req.file.path : null; // Get file path if uploaded

    // Validate user inputs
    const nameAndPhoneValidation = validateNameAndPhone(name, phone);
    if (!nameAndPhoneValidation.isValid) {
        return res.status(400).json({ message: nameAndPhoneValidation.message });
    }

    const dobValidation = validateDob(dob);
    if (!dobValidation.isValid) {
        return res.status(400).json({ message: dobValidation.message });
    }

    const classValidation = validateClass(studentClass);
    if (!classValidation.isValid) {
        return res.status(400).json({ message: classValidation.message });
    }

    const emailValidation = validateEmail(username);
    if (!emailValidation.isValid) {
        return res.status(400).json({ message: emailValidation.message });
    }

    const users = readData();
    const userIndex = users.findIndex((user) => user._id === id);
    if (userIndex === -1) {
        return res.status(404).json({ message: "User not found" });
    }

    // Prepare updated user data
    const updatedUser = { ...users[userIndex] };
    if (username) updatedUser.username = username;
    if (password) updatedUser.password = await bcrypt.hash(password, 10);
    if (profilePhoto) updatedUser.profilePhoto = profilePhoto; // Update profile photo
    if (phone) updatedUser.phone = phone;
    if (dob) updatedUser.dob = dob;
    if (studentClass) updatedUser.studentClass = studentClass;
    if (name) updatedUser.name = name;

    users[userIndex] = updatedUser;
    writeData(users);
    if (updatedUser.profilePhoto) {
        const fileData = fs.readFileSync(profilePhoto);
        const mimeType = 'image/jpeg'; // Replace with correct MIME type if necessary
              updatedUser.profilePhoto =  `data:${mimeType};base64,${fileData.toString('base64')}`;
    }
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.status(200).json(userWithoutPassword);
};

const deleteUser = (req, res) => {
    const { id } = req.params;

    const users = readData();
    const newUsers = users.filter((user) => user._id !== id);

    if (users.length === newUsers.length) {
        return res.status(404).json({ message: "User not found" });
    }

    writeData(newUsers);
    res.status(200).json({ message: "User deleted successfully" });
};

module.exports = {
    registerUser,
    loginUser,
    getUsers,
    updateUser,
    deleteUser,
};
