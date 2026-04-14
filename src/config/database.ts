import mongoose from 'mongoose';

// Cached connection for serverless — avoids opening a new connection on every invocation.
let isConnected = false;

export async function connectDatabase(): Promise<void> {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');

  await mongoose.connect(uri, { bufferCommands: false });
  isConnected = true;
}
