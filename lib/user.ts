import crypto from 'crypto';
import mongoose from 'mongoose';

export const createUser = data => {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto
    .pbkdf2Sync(data.password, salt, 1000, 64, 'sha512')
    .toString('hex')
  const user = {
    id: new mongoose.Types.ObjectId,
    createdAt: Date.now(),
    email: data.email,
    hash,
    salt,
  }
  return user;
}

export const validatePassword = (user: any, inputPassword: string) => {
  const inputHash = crypto
    .pbkdf2Sync(inputPassword, user.salt, 1000, 64, 'sha512')
    .toString('hex');
  const passwordsMatch = user.hash === inputHash;

  return passwordsMatch
}
