// FRONTEND COMPONENTS & BUTTON HANDLERS (React)

// Button Component with consistent styling
import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Reusable styled button component
const ActionButton = ({ text, onClick, primary = true, className = '' }) => {
    return ( <
        button onClick = { onClick }
        className = { `px-4 py-2 rounded font-semibold transition-all duration-300 ${
        primary 
          ? 'bg-orange-500 hover:bg-orange-600 text-white' 
          : 'bg-blue-700 hover:bg-blue-800 text-white'
      } ${className}` } >
        { text } <
        /button>
    );
};

// Component for top navigation button
export const ViewPreviousSummit = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        // Track analytics event
        trackButtonClick('view_previous_summit');
        // Navigate to summit highlights page
        navigate('/summit-highlights');
    };

    return ( <
        ActionButton text = "View Previous Summit Highlights"
        onClick = { handleClick }
        />
    );
};

// Component for application download button
export const DownloadApplication = () => {
    const handleDownload = async() => {
        try {
            // Track analytics event
            trackButtonClick('download_application');

            // Get application form PDF from server
            const response = await axios.get('/api/forms/chapter-application', {
                responseType: 'blob',
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'YSN_Chapter_Application_Form.pdf');
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading application:', error);
            alert('Failed to download application form. Please try again later.');
        }
    };

    return ( <
        ActionButton text = "Download Application Form"
        onClick = { handleDownload }
        />
    );
};

// Component for contacting chapter coordinator
export const ContactCoordinator = () => {
    const navigate = useNavigate();

    const handleContact = () => {
        // Track analytics event
        trackButtonClick('contact_coordinator');
        navigate('/contact-coordinator');
    };

    return ( <
        ActionButton text = "Contact Chapter Coordinator"
        onClick = { handleContact }
        />
    );
};

// Components for the bottom buttons
export const StartChapter = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        // Track analytics event
        trackButtonClick('start_chapter');
        navigate('/start-chapter');
    };

    return ( <
        ActionButton text = "Start a Chapter"
        onClick = { handleStart }
        primary = { true }
        />
    );
};

export const JoinExistingChapter = () => {
    const navigate = useNavigate();

    const handleJoin = () => {
        // Track analytics event
        trackButtonClick('join_existing');
        navigate('/join-chapter');
    };

    return ( <
        ActionButton text = "Join Existing Chapter"
        onClick = { handleJoin }
        primary = { false }
        />
    );
};

// Analytics tracking helper function
const trackButtonClick = (buttonId) => {
    // This could be connected to Google Analytics, Mixpanel, etc.
    console.log(`Button clicked: ${buttonId}`);
    // Example with a service like Mixpanel
    // mixpanel.track('Button Click', { button: buttonId });
};

// BACKEND ROUTES (Express)

// routes/forms.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Chapter = require('../models/Chapter');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const auth = require('../middleware/auth');

// Route to get the application form
router.get('/forms/chapter-application', (req, res) => {
    const filePath = path.join(__dirname, '../public/forms/YSN_Chapter_Application_Form.pdf');

    // Check if file exists
    if (fs.existsSync(filePath)) {
        res.download(filePath, 'YSN_Chapter_Application_Form.pdf');
    } else {
        res.status(404).json({ message: 'Application form not found' });
    }
});

// Route to get summit highlights
router.get('/summit-highlights', async(req, res) => {
    try {
        // Could fetch from database or return static content
        const highlights = await Summit.findOne({ year: '2024' })
            .select('highlights photos testimonials')
            .lean();

        res.json(highlights);
    } catch (error) {
        console.error('Error fetching summit highlights:', error);
        res.status(500).json({ message: 'Failed to fetch summit highlights' });
    }
});

// Route to submit contact request to coordinator
router.post('/contact-coordinator', async(req, res) => {
    try {
        const { name, email, university, message } = req.body;

        // Validate inputs
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Save contact request to database
        const contactRequest = new ContactRequest({
            name,
            email,
            university,
            message,
            status: 'pending',
            createdAt: new Date()
        });

        await contactRequest.save();

        // Send email notification to coordinator
        await sendEmail({
            to: 'coordinator@ysn.org',
            subject: 'New Chapter Coordinator Contact Request',
            text: `New contact request from ${name} (${email}) at ${university || 'N/A'}.\n\nMessage: ${message}`,
            html: `<p>New contact request from <strong>${name}</strong> (${email}) at ${university || 'N/A'}.</p><p>Message: ${message}</p>`
        });

        // Send confirmation email to user
        await sendEmail({
            to: email,
            subject: 'YSN - We received your inquiry',
            text: `Thank you for contacting the YSN Chapter Coordinator. We have received your message and will get back to you shortly.`,
            html: `<p>Thank you for contacting the YSN Chapter Coordinator. We have received your message and will get back to you shortly.</p>`
        });

        res.status(201).json({ message: 'Contact request submitted successfully' });
    } catch (error) {
        console.error('Error submitting contact request:', error);
        res.status(500).json({ message: 'Failed to submit contact request' });
    }
});

// Route to start new chapter application
router.post('/start-chapter', auth, async(req, res) => {
    try {
        const {
            universityName,
            foundingMembers,
            activityCalendar,
            additionalInfo
        } = req.body;

        // Validate inputs
        if (!universityName || !foundingMembers || foundingMembers.length < 15 || !activityCalendar) {
            return res.status(400).json({
                message: 'Please ensure you have at least 15 founding members and have completed all required fields'
            });
        }

        // Create new chapter application
        const application = new ChapterApplication({
            userId: req.user.id,
            universityName,
            foundingMembers,
            activityCalendar,
            additionalInfo,
            status: 'pending',
            submittedAt: new Date()
        });

        await application.save();

        // Notify national secretariat
        await sendEmail({
            to: 'secretariat@ysn.org',
            subject: 'New Chapter Application Received',
            text: `A new chapter application has been submitted by ${req.user.name} for ${universityName}.`,
            html: `<p>A new chapter application has been submitted by <strong>${req.user.name}</strong> for <strong>${universityName}</strong>.</p>`
        });

        res.status(201).json({
            message: 'Chapter application submitted successfully',
            applicationId: application._id
        });
    } catch (error) {
        console.error('Error submitting chapter application:', error);
        res.status(500).json({ message: 'Failed to submit chapter application' });
    }
});

// Route to join existing chapter
router.post('/join-chapter', auth, async(req, res) => {
    try {
        const { chapterId } = req.body;

        // Validate inputs
        if (!chapterId) {
            return res.status(400).json({ message: 'Please provide chapter ID' });
        }

        // Check if chapter exists
        const chapter = await Chapter.findById(chapterId);
        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }

        // Check if user is already a member
        const user = await User.findById(req.user.id);
        if (user.chapterId && user.chapterId.equals(chapterId)) {
            return res.status(400).json({ message: 'You are already a member of this chapter' });
        }

        // Add user to chapter
        user.chapterId = chapterId;
        user.membershipDate = new Date();
        await user.save();

        // Update chapter membership count
        chapter.memberCount += 1;
        await chapter.save();

        // Notify chapter admin
        await sendEmail({
            to: chapter.adminEmail,
            subject: 'New Member Joined Your Chapter',
            text: `${user.name} has joined your YSN chapter.`,
            html: `<p><strong>${user.name}</strong> has joined your YSN chapter.</p>`
        });

        res.json({ message: 'Successfully joined chapter' });
    } catch (error) {
        console.error('Error joining chapter:', error);
        res.status(500).json({ message: 'Failed to join chapter' });
    }
});

module.exports = router;

// DATABASE MODELS (MongoDB/Mongoose)

// models/Chapter.js
const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    university: {
        type: String,
        required: true,
        trim: true
    },
    foundingDate: {
        type: Date,
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    adminEmail: {
        type: String,
        required: true
    },
    memberCount: {
        type: Number,
        default: 0
    },
    activityCalendar: {
        type: Object,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
    location: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Chapter', chapterSchema);

// models/ChapterApplication.js
const mongoose = require('mongoose');

const chapterApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    universityName: {
        type: String,
        required: true,
        trim: true
    },
    foundingMembers: [{
        name: String,
        email: String,
        role: String
    }],
    activityCalendar: {
        type: Object,
        required: true
    },
    additionalInfo: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    decisionDate: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('ChapterApplication', chapterApplicationSchema);

// models/ContactRequest.js
const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    university: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'resolved'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('ContactRequest', contactRequestSchema);

// MAIN APP CONFIGURATION (MERN Integration)

// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', require('./routes/forms'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chapters', require('./routes/chapters'));

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Email Service Utility

// utils/emailService.js
const nodemailer = require('nodemailer');

// Configure transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send email function
const sendEmail = async({ to, subject, text, html }) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html
    };

    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendEmail
};