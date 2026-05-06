const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all contacts (Admin only)
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

// POST a new contact message (Public)
exports.submitContact = async (req, res) => {
  try {
    const { fullName, email, subject, message } = req.body;

    // Basic validation: only email is strictly required for things like newsletter
    if (!email) {
      return res.status(400).json({ error: 'Email is a required field.' });
    }

    const contact = await prisma.contact.create({
      data: {
        fullName: fullName || 'Subscriber',
        email,
        subject: subject || 'Contact Form Submission',
        message: message || 'No message provided.'
      }
    });

    res.status(201).json({ message: 'Your message has been sent successfully. We will get back to you soon!', contact });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'An error occurred while submitting your message.' });
  }
};
// DELETE contact message (Admin)
exports.deleteContact = async (req, res) => {
  try {
    await prisma.contact.delete({ where: { id: req.params.id } });
    res.json({ message: 'Contact message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact message' });
  }
};
