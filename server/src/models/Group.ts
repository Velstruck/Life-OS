import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  inviteCode: string;
  createdBy: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  expenses: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    expenses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Expense',
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IGroup>('Group', groupSchema);
