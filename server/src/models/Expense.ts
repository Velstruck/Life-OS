import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  groupId: mongoose.Types.ObjectId;
  description: string;
  amount: number;
  paidBy: mongoose.Types.ObjectId;
  splits: Array<{
    userId: mongoose.Types.ObjectId;
    amount: number;
  }>;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    splits: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IExpense>('Expense', expenseSchema);
