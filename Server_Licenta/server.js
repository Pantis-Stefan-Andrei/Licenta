// index.js
const nodemailer = require("nodemailer");
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const User = require("./modele/users");
const bcrypt = require("bcrypt");
const dotenv = require('dotenv');
const Groups = require('./modele/Groups');
const pages = require('./modele/LandingPages');
const SendingUsers = require('./modele/SendingUsers');
const SendingProfile = require('./modele/SendingProfile');
const Email = require('./modele/Email');
const Campaine = require('./modele/Campain');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.log(err));


// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the Node.js & MongoDB API');
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) return res.status(400).send("Invalid username or password.");

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword)
    return res.status(400).send("Invalid username or password.");

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

  res.send({ token });
});

app.post("/register", async (req, res) => {
  try {
    const { username,name,email,role, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      username,
      password: hashedPassword,
      name,
      role,
      email,
    });

    const savedUser = await user.save();
    res.json({
      message: "User registered successfully",
      userId: savedUser._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});





// /////////////// groups collection




app.post('/groups', async (req, res) => {
    try {
        const group = new Groups(req.body);
        await group.save();
        res.status(201).json(group);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


app.post('/groups_add', async (req, res) => {
    try {
  
      const { firstName, lastName, emailAddress, position, GroupName } = req.body;
  
 
      if (!firstName || !lastName || !emailAddress || !position || !GroupName) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  

      const newIndividual = new Groups({ firstName, lastName, emailAddress, position, GroupName });
  
     
      await newIndividual.save();
  
   
      res.status(201).json({ message: 'Individual added successfully', individual: newIndividual });
    } catch (error) {
      console.error("Error adding individual:", error);
      res.status(500).json({ error: "Failed to add individual" });
    }
  });
  

  app.get('/groups', async (req, res) => {
    try {
        const groups = await Groups.find();
        res.json(groups);
    } catch (err) {
        console.error("Error retrieving groups:", err); // Make sure this is visible in your console
        res.status(500).json({ error: err.message });
    }
});

// Delete a group by ID
app.delete('/groups/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
    
        const deletedGroup = await Groups.findByIdAndDelete(id);

      
        if (!deletedGroup) {
            return res.status(404).json({ error: "Group not found" });
        }

        res.status(200).json({ message: "Group deleted successfully" });
    } catch (err) {
        console.error("Error deleting group:", err);
        res.status(500).json({ error: "Failed to delete group" });
    }
});




///////////////////  all pages





app.post('/page_add', async (req, res) => {
  try {
    const { name, html, capture_credentials, capture_passwords, redirect_url } = req.body;

    if (!name || !html) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newPage = new pages({ name, html, capture_credentials, capture_passwords, redirect_url });
    await newPage.save();

    res.status(201).json({ message: 'Page added successfully', page: newPage });
  } catch (error) {
    console.error("Error adding page:", error);
    res.status(500).json({ error: "Failed to add page" });
  }
});


app.get('/page', async (req, res) => {
  try {
    const pageList = await pages.find();
    res.json(pageList);
  } catch (error) {
    console.error("Error retrieving pages:", error);
    res.status(500).json({ error: "Failed to retrieve pages" });
  }
});
app.get('/page/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pageList = await pages.findById(id);
    res.json(pageList);
  } catch (error) {
    console.error("Error retrieving pages:", error);
    res.status(500).json({ error: "Failed to retrieve pages" });
  }
});


app.delete('/page/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPage = await pages.findByIdAndDelete(id);

    if (!deletedPage) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.status(200).json({ message: "Page deleted successfully" });
  } catch (error) {
    console.error("Error deleting page:", error);
    res.status(500).json({ error: "Failed to delete page" });
  }
});


/////// sendig profile 




app.get('/profile', async (req, res) => {
  try {
    const pageList = await SendingProfile.find();
    res.json(pageList);
  } catch (error) {
    console.error("Error retrieving pages:", error);
    res.status(500).json({ error: "Failed to retrieve pages" });
  }
});
app.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pageList = await SendingProfile.findById(id);
    res.json(pageList);
  } catch (error) {
    console.error("Error retrieving pages:", error);
    res.status(500).json({ error: "Failed to retrieve pages" });
  }
});

// Delete a page by ID
app.delete('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPage = await SendingProfile.findByIdAndDelete(id);

    if (!deletedPage) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.status(200).json({ message: "Page deleted successfully" });
  } catch (error) {
    console.error("Error deleting page:", error);
    res.status(500).json({ error: "Failed to delete page" });
  }
});
app.post("/profile", async (req, res) => {
  try {
    const { nameCampain,senderAdress,name,email, password ,host} = req.body;

    const existingUser = await SendingProfile.findOne({ nameCampain });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new SendingProfile({
      nameCampain,
      senderAdress,
      password: hashedPassword,
      name,
      email,
      host,
    });

    const savedUser = await user.save();
    res.json({
      message: "User registered successfully",
      userId: savedUser._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

///////////////////  all Emails





app.post('/email', async (req, res) => {
  try {
    const { name, senderEmail, title, body } = req.body;

    if (!name || !senderEmail|| !title|| !body) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newPage = new Email({ name, senderEmail, title, body });
    await newPage.save();

    res.status(201).json({ message: 'Email added successfully', page: newPage });
  } catch (error) {
    console.error("Error adding email:", error);
    res.status(500).json({ error: "Failed to add email" });
  }
});


app.get('/email', async (req, res) => {
  try {
    const pageList = await Email.find();
    res.json(pageList);
  } catch (error) {
    console.error("Error retrieving pages:", error);
    res.status(500).json({ error: "Failed to retrieve pages" });
  }
});
app.get('/email/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pageList = await Email.findById(id);
    res.json(pageList);
  } catch (error) {
    console.error("Error retrieving pages:", error);
    res.status(500).json({ error: "Failed to retrieve pages" });
  }
});


app.delete('/email/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPage = await Email.findByIdAndDelete(id);

    if (!deletedPage) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.status(200).json({ message: "Page deleted successfully" });
  } catch (error) {
    console.error("Error deleting page:", error);
    res.status(500).json({ error: "Failed to delete page" });
  }
});


//////////// cmapaine 



app.get('/campaine', async (req, res) => {
  try {
    const pageList = await Campaine.find();
    res.json(pageList);
  } catch (error) {
    console.error("Error retrieving pages:", error);
    res.status(500).json({ error: "Failed to retrieve pages" });
  }
});
app.get('/campaine/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pageList = await Campaine.findById(id);
    res.json(pageList);
  } catch (error) {
    console.error("Error retrieving pages:", error);
    res.status(500).json({ error: "Failed to retrieve pages" });
  }
});

// Delete a page by ID
app.delete('/campaine/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPage = await Campaine.findByIdAndDelete(id);

    if (!deletedPage) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.status(200).json({ message: "Page deleted successfully" });
  } catch (error) {
    console.error("Error deleting page:", error);
    res.status(500).json({ error: "Failed to delete page" });
  }
});

app.post('/campaine', async (req, res) => {
  try {
    const { name,group,page,profile, email} = req.body;

    if (!name || !group|| !page|| !profile|| !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newPage = new Campaine({ name, group, page, profile ,email});
    await newPage.save();

    res.status(201).json({ message: 'Campaine added successfully', page: newPage });
  } catch (error) {
    console.error("Error adding Campaine:", error);
    res.status(500).json({ error: "Failed to add Campaine" });
  }
});



/////////    option


app.get('/option', async (req, res) => {
 
  try {
  const groups = await Groups.find();
    const page = await pages.find();
    const profiles = await SendingProfile.find();
    const emails = await Email.find();

    // Map the results to extract names or addresses
    const groupNames = groups.map((group) => group.GroupName);
    const pageNames = page.map((page) => page.name);
    const profileNames = profiles.map((profile) => profile.nameCampain);
    const emailAddresses = emails.map((email) => email.name);
    // console.log(groupNames);
    // console.log(pageNames);
    // console.log(profileNames);
    // console.log(emailAddresses);
    // Return the structured response
    
    res.status(201).json({ message: 'Campaine added successfully', group: groupNames, page: pageNames,profile: profileNames,   email: emailAddresses});
     
   
  } catch (error) {
    console.error('Error fetching options:', error);
    throw new Error('Failed to fetch options');
  }
});





///////////////////// smtp 






// Endpoint to send emails for a specific campaign
app.post("/campaine/send-emails/:id", async (req, res) => {
  try {
    const { id } = req.params; // Campaign ID

    // Fetch the campaign details
    const campaign = await Campaine.findById(id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Fetch the associated sending profile
    const sendingProfile = await SendingProfile.findOne({ nameCampain: campaign.profile });
    if (!sendingProfile) {
      return res.status(404).json({ error: "Sending profile not found" });
    }

    // Fetch the email content
    const email = await Email.findOne({ name: campaign.email });
    if (!email) {
      return res.status(404).json({ error: "Email template not found" });
    }

    // Fetch the group (recipients)
    const group = await Groups.findOne({ GroupName: campaign.group });
    if (!group || !group.emailAddress) {
      return res.status(404).json({ error: "Group or recipients not found" });
    }

    // Decrypt the SMTP password
    const smtpPassword = await bcrypt.compare(sendingProfile.password, sendingProfile.password);

    // Set up the SMTP transporter
    const transporter = nodemailer.createTransport({
      host: sendingProfile.host,
      port: 587, // Adjust if necessary (587 is common for TLS, 465 for SSL)
      secure: false, // Set to true if using SSL
      auth: {
        user: sendingProfile.senderAdress,
        pass: smtpPassword,
      },
    });

    // Define the email options
    const mailOptions = {
      from: `${sendingProfile.name} <${sendingProfile.senderAdress}>`,
      to: group.emailAddress, // Assuming this is a single email or array of emails
      subject: email.title,
      html: email.body,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    // Log or save the result
    console.log(`Email sent: ${info.messageId}`);
    res.status(200).json({ message: "Emails sent successfully", messageId: info.messageId });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ error: "Failed to send emails" });
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
