// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

// MongoDB Schema for Assignments
const assignmentSchema = new mongoose.Schema({
  studentName: String,
  assignmentTitle: String,
  fileUrl: String,
  marks: { type: Number, default: null },  // Marks out of 10
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

// Multer configuration for file uploads (Cloudinary)
const storage = require('multer-storage-cloudinary').CloudinaryStorage;
const upload = multer({
  storage: new storage({
    cloudinary: cloudinary,
    params: {
      folder: 'assignments',
      allowed_formats: ['pdf', 'doc', 'docx'],
    },
  }),
});

app.post('/api/upload-assignment', upload.single('file'), async (req, res) => {
  try {
    const { studentName, assignmentTitle } = req.body;
    const fileUrl = req.file.secure_url;

    // Save the assignment data to MongoDB
    const newAssignment = new Assignment({ studentName, assignmentTitle, fileUrl });
    await newAssignment.save();

    res.status(200).json({ message: 'Assignment uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading assignment', error });
  }
});

// Route to get assignments for a student
app.get('/api/view-assignments', async (req, res) => {
  try {
    const assignments = await Assignment.find({}).select('studentName assignmentTitle fileUrl marks');
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments', error });
  }
});

// Route to update marks for a student assignment
app.put('/api/update-marks/:id', async (req, res) => {
  const { marks } = req.body;
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, { marks }, { new: true });
    res.status(200).json({ message: 'Marks updated', assignment });
  } catch (error) {
    res.status(500).json({ message: 'Error updating marks', error });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
