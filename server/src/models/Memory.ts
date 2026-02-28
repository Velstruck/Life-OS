import mongoose, { Schema, Document } from 'mongoose';

export interface IMemory extends Document {
  userId: mongoose.Types.ObjectId;
  title?: string;
  content: string;
  images: string[];
  category: 'memory' | 'thought' | 'quote';
  createdAt: Date;
  updatedAt: Date;
}

const memorySchema = new Schema<IMemory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    category: {
      type: String,
      enum: ['memory', 'thought', 'quote'],
      default: 'memory',
    },
  },
  { timestamps: true }
);

memorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IMemory>('Memory', memorySchema);
