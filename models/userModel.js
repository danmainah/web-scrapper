const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
  },
  activities: [{ type: mongoose.Types.ObjectId, ref: 'Activity' }],
  categories: [{ type: mongoose.Types.ObjectId, ref: 'Category' }],
});
// secure password by hashing it
UserSchema.pre(
    'save',
    async function(next) {
      const user = this;
      const hash = await bcrypt.hash(this.password, 12);
  
      this.password = hash;
      next();
    }
  );
// check if user is valid
  UserSchema.methods.isValidPassword = async function(password) {
    const user = this;
    const compare = await bcrypt.compare(password, user.password);
  
    return compare;
  }
  
UserSchema.plugin(passportLocalMongoose);

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;