import mongoose from 'mongoose';

const contactSchema = mongoose.Schema({
    Name: String,
    Message: String,
    Subject: String,
    Email: String,
    PhoneNumber: String,
    createdAt: {
        type: Date,
        default: new Date()
    }, 
});

const ContactForm = mongoose.model('ContactForm', contactSchema);

export default ContactForm;
