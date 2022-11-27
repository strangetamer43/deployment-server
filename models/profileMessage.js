import mongoose from 'mongoose';

const profileSchema = mongoose.Schema({
    introduction: String,
    education: String,
    education1: String,
    education2: String,
    certifications: [String],
    certificationURL: [String],
    goals: String,
    creator: String,
    name: String,
    avatarUrl: String,
    number: String,
})

const ProfileMessage = mongoose.model('ProfileMessage', profileSchema);

export default ProfileMessage;