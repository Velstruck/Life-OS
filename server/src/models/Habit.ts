import mongoose, { Schema, Document } from 'mongoose';

export interface IHabitLog {
  date: string;
  completedBy: mongoose.Types.ObjectId[];
}

export interface IHabit extends Document {
  title: string;
  description?: string;
  inviteCode: string;
  createdBy: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  logs: IHabitLog[];
  createdAt: Date;
  updatedAt: Date;
}

const habitSchema = new Schema<IHabit>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
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
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    logs: [
      {
        date: {
          type: String,
          required: true,
        },
        completedBy: [
          {
            type: Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IHabit>('Habit', habitSchema);
