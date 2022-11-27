import mongoose from 'mongoose';

const followerSchema = mongoose.Schema({
    followers: String,
    names: String,
    owner: String,
});
const FollowerMessage = mongoose.model('FollowerMessage', followerSchema);

export default FollowerMessage;