import { z } from 'zod';

// Post content validation
export const postContentSchema = z.object({
  content: z.string()
    .trim()
    .min(1, { message: "Content cannot be empty" })
    .max(5000, { message: "Content must be less than 5000 characters" }),
  category: z.enum(['general', 'project', 'career', 'technical', 'news']),
});

// Sign up validation
export const signUpSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(128, { message: "Password must be less than 128 characters" }),
  fullName: z.string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  userType: z.enum(['student', 'professional', 'company']),
  profession: z.string().min(1, { message: "Profession is required" }),
});

// Sign in validation
export const signInSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" }),
  password: z.string()
    .min(1, { message: "Password is required" }),
});

// Profile update validation
export const profileUpdateSchema = z.object({
  full_name: z.string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" })
    .optional(),
  bio: z.string()
    .max(500, { message: "Bio must be less than 500 characters" })
    .optional(),
  profession: z.string().max(100).optional(),
  organization: z.string().max(100).optional(),
  title: z.string().max(100).optional(),
});

// Comment validation
export const commentSchema = z.object({
  content: z.string()
    .trim()
    .min(1, { message: "Comment cannot be empty" })
    .max(1000, { message: "Comment must be less than 1000 characters" }),
});

// Message validation
export const messageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, { message: "Message cannot be empty" })
    .max(2000, { message: "Message must be less than 2000 characters" }),
});
