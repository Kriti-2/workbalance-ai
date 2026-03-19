const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['Manager', 'Member'], default: 'Member' },
  avatar:   { type: String, default: '' },
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (this.isModified('password'))
    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', UserSchema);
