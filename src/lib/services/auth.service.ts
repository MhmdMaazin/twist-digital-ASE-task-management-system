import connectDB from '../db/mongodb';
import User, { IUser } from '../db/models/User';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../auth/jwt';
import { RegisterInput, LoginInput } from '../validations/auth';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterInput): Promise<{
    user: Partial<IUser>;
    accessToken: string;
    refreshToken: string;
  }> {
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = await User.create({
      email: data.email,
      password: data.password,
      name: data.name,
    });

    // Generate tokens
    const accessToken = await generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const refreshToken = await generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Return user without password
    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  static async login(data: LoginInput): Promise<{
    user: Partial<IUser>;
    accessToken: string;
    refreshToken: string;
  }> {
    await connectDB();

    // Find user with password field (normally excluded)
    const user = await User.findOne({ email: data.email }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const accessToken = await generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const refreshToken = await generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Return user without password
    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  static async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    await connectDB();

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    // Verify user still exists
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new tokens
    const newAccessToken = await generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const newRefreshToken = await generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<Partial<IUser> | null> {
    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}
