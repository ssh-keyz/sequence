import bcrypt from 'bcrypt';
import { db } from '../config/database';
import jwt from 'jsonwebtoken';
import session from 'express-session';

declare module 'express-session' {
  export interface SessionData {
    user: { [key: string]: any };
  }
}

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreateInput {
  username: string;
  email: string;
  password: string;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export class UserModel {
  private static readonly SALT_ROUNDS = 10;

  /**
   * Create a new user
   */
  static async create({ username, email, password }: UserCreateInput): Promise<User> {
    const password_hash = await bcrypt.hash(password, this.SALT_ROUNDS);
    
    return db.one<User>(
      `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [username, email, password_hash]
    );
  }

  /**
   * Find a user by their ID
   */
  static async findById(id: string): Promise<User | null> {
    return db.oneOrNone<User>('SELECT * FROM users WHERE id = $1', [id]);
  }

  /**
   * Find a user by their username
   */
  static async findByUsername(username: string): Promise<User | null> {
    return db.oneOrNone<User>('SELECT * FROM users WHERE username = $1', [username]);
  }

  /**
   * Find a user by their email
   */
  static async findByEmail(email: string): Promise<User | null> {
    return db.oneOrNone<User>('SELECT * FROM users WHERE email = $1', [email]);
  }

  /**
   * Authenticate a user and return JWT tokens if successful
   */
  static async authenticate({ email, password }: UserLoginInput): Promise<{ 
    user: Omit<User, 'password_hash'>,
    token: string,
    refreshToken: string 
  } | null> {
    const user = await this.findByEmail(email);
    
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return null;
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY }
    );

    const { password_hash, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token,
      refreshToken
    };
  }

  /**
   * Refresh a JWT token
   */
  static async refreshToken(refreshToken: string): Promise<{ token: string } | null> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as { userId: string, type: string };
      
      if (decoded.type !== 'refresh') {
        return null;
      }

      const user = await this.findById(decoded.userId);
      
      if (!user) {
        return null;
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRY }
      );

      return { token };
    } catch (error) {
      return null;
    }
  }

  /**
   * Update a user's information
   */
  static async update(
    id: string,
    updates: Partial<Omit<UserCreateInput, 'password'> & { password?: string }>
  ): Promise<User> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    if (updates.username) {
      updateFields.push(`username = $${valueIndex}`);
      values.push(updates.username);
      valueIndex++;
    }

    if (updates.email) {
      updateFields.push(`email = $${valueIndex}`);
      values.push(updates.email);
      valueIndex++;
    }

    if (updates.password) {
      const password_hash = await bcrypt.hash(updates.password, this.SALT_ROUNDS);
      updateFields.push(`password_hash = $${valueIndex}`);
      values.push(password_hash);
      valueIndex++;
    }

    values.push(id);

    return db.one<User>(
      `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${valueIndex}
      RETURNING *
      `,
      values
    );
  }
} 