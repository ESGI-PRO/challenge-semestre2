import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { trainerSpecialityTypes } from '../services/config/trainerSpeciality.types'

const SALT_ROUNDS = 10;

function transformValue(doc, ret: { [key: string]: any }) {
  delete ret._id;
  delete ret.password;
}

export interface IUserSchema extends mongoose.Document {
  email: string;
  userName: string;
  mobileNumber: string;
  isTrainer: Boolean;
  isAdmin: Boolean;
  trainerSpeciality: string;
  trainerId: string;
  traineeIds: Array<string>;
  password: string;
  is_confirmed: boolean;
  role: string;
  comparePassword: (password: string) => Promise<boolean>;
  getEncryptedPassword: (password: string) => Promise<string>;
}

export const UserSchema = new mongoose.Schema<IUserSchema>(
  {
    email: {
      type: String,
      required: [true, 'Email can not be empty'],
      match: [
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Email should be valid',
      ],
    },
    is_confirmed: {
      type: Boolean,
      required: [true, 'Confirmed can not be empty'],
    },
    password: {
      type: String,
      required: [true, 'Password can not be empty'],
      minlength: [6, 'Password should include at least 6 chars'],
    },
    userName: {
      type: String,
      required: [true, 'User name can not be empty'],
      minlength: [3, 'User name should include at least 3 chars']
    },
    mobileNumber: {
      type: String,
      required: [false, 'Mobile number can not be empty'],
      minlength: [10, 'Mobile number should include at least 10 chars']
    },
    isTrainer: {
      type: Boolean,
      required: [false, ''],
    },
    isAdmin: {
      type: Boolean,
      required: [false, ''],
    },
    trainerId: {
      type: String,
      required: [false, ''],
    },
    traineeIds: {
      type: Array as any,
      required: [false, ''],
    },
    trainerSpeciality: {
      type: String,
      enum: [trainerSpecialityTypes.YOGA, trainerSpecialityTypes.FITNESS, trainerSpecialityTypes.POWERLIFTING, trainerSpecialityTypes.NONE],
      required: [false, '']
    },
    role: {
      type: String,
      default: 'USER',
      enum: ['USER', 'ADMIN'],
      required: [true, 'Role can not be empty'],
    },
  },
  {
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: transformValue,
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: transformValue,
    },
  },
);

UserSchema.methods.getEncryptedPassword = (
  password: string,
): Promise<string> => {
  return bcrypt.hash(String(password), SALT_ROUNDS);
};

UserSchema.methods.compareEncryptedPassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await this.getEncryptedPassword(this.password);
  next();
});
