import { z } from "zod";

// Umbrella locations
export const LOCATIONS = {
  DOME: "ใต้โดม",
  SPORTS: "ศูนย์กีฬา", 
  CAFETERIA: "โรงอาหาร"
} as const;

export type Location = typeof LOCATIONS[keyof typeof LOCATIONS];

// Umbrella status
export const UMBRELLA_STATUS = {
  AVAILABLE: "available",
  BORROWED: "borrowed"
} as const;

export type UmbrellaStatus = typeof UMBRELLA_STATUS[keyof typeof UMBRELLA_STATUS];

// Activity types
export const ACTIVITY_TYPE = {
  BORROW: "borrow",
  RETURN: "return"
} as const;

export type ActivityType = typeof ACTIVITY_TYPE[keyof typeof ACTIVITY_TYPE];

// Umbrella schema
export const umbrellaSchema = z.object({
  id: z.number().min(1).max(21),
  status: z.enum([UMBRELLA_STATUS.AVAILABLE, UMBRELLA_STATUS.BORROWED]),
  currentLocation: z.enum([LOCATIONS.DOME, LOCATIONS.SPORTS, LOCATIONS.CAFETERIA]),
  borrower: z.object({
    uid: z.string(),
    nickname: z.string(),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
    timestamp: z.number()
  }).optional(),
  history: z.array(z.object({
    type: z.enum([ACTIVITY_TYPE.BORROW, ACTIVITY_TYPE.RETURN]),
    timestamp: z.number(),
    location: z.enum([LOCATIONS.DOME, LOCATIONS.SPORTS, LOCATIONS.CAFETERIA]),
    nickname: z.string().optional()
  })).default([])
});

export type Umbrella = z.infer<typeof umbrellaSchema>;

// Borrow form schema
export const borrowFormSchema = z.object({
  nickname: z.string().min(1, "กรุณากรอกชื่อเล่น"),
  phone: z.string().regex(/^[0-9]{10}$/, "กรุณากรอกเบอร์โทร 10 หลัก"),
  umbrellaId: z.number().min(1).max(21)
});

export type BorrowForm = z.infer<typeof borrowFormSchema> & {
  location?: Location; // Added during form processing
};

// Return form schema - ลบ returnLocation เพราะจะคืนที่เดิมอัตโนมัติ
export const returnFormSchema = z.object({
  umbrellaId: z.number().min(1).max(21, "กรุณาเลือกหมายเลขร่ม 1-21")
});

export type ReturnForm = z.infer<typeof returnFormSchema>;

// Admin login schema
export const adminLoginSchema = z.object({
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน")
});

export type AdminLogin = z.infer<typeof adminLoginSchema>;

// User registration schema
export const userRegistrationSchema = z.object({
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  grade: z.string().min(1, "กรุณากรอกชั้น"),
  studentNumber: z.string().min(1, "กรุณากรอกเลขที่"),
  phone: z.string().regex(/^[0-9]{10}$/, "กรุณากรอกเบอร์โทร 10 หลัก"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน")
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"]
});

export type UserRegistration = z.infer<typeof userRegistrationSchema>;

// User login schema
export const userLoginSchema = z.object({
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน")
});

export type UserLogin = z.infer<typeof userLoginSchema>;

// User profile schema
export const userProfileSchema = z.object({
  uid: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  grade: z.string(),
  studentNumber: z.string(),
  phone: z.string(),
  email: z.string(),
  role: z.enum(['user', 'admin', 'owner']).default('user'),
  createdAt: z.number(),
  updatedAt: z.number(),
  // Encrypted password (for admin management)
  encryptedPassword: z.string().optional(),
  // Temporary password fields (optional)
  temporaryPassword: z.string().optional(),
  tempPasswordCreated: z.number().optional(),
  tempPasswordExpires: z.number().optional(),
  requirePasswordChange: z.boolean().optional()
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// Admin user management schema
export const adminUserUpdateSchema = z.object({
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  grade: z.string().min(1, "กรุณากรอกชั้น"),
  studentNumber: z.string().min(1, "กรุณากรอกเลขที่"),
  phone: z.string().regex(/^[0-9]{10}$/, "กรุณากรอกเบอร์โทร 10 หลัก"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  role: z.enum(['user', 'admin', 'owner'])
});

export type AdminUserUpdate = z.infer<typeof adminUserUpdateSchema>;

// Password reset by admin schema
export const adminPasswordResetSchema = z.object({
  newPassword: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"]
});

export type AdminPasswordReset = z.infer<typeof adminPasswordResetSchema>;

// Activity schema
export const activitySchema = z.object({
  type: z.enum(['borrow', 'return', 'admin_update']),
  umbrellaId: z.number().min(1).max(21),
  nickname: z.string().optional(),
  location: z.enum([LOCATIONS.DOME, LOCATIONS.SPORTS, LOCATIONS.CAFETERIA]),
  timestamp: z.number(),
  note: z.string().optional(),
  userInfo: z.object({
    uid: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    grade: z.string(),
    studentNumber: z.string(),
    phone: z.string()
  }).optional()
});

export type Activity = z.infer<typeof activitySchema>;

// Helper functions
export function getLocationForUmbrella(umbrellaId: number): Location {
  if (umbrellaId >= 1 && umbrellaId <= 7) return LOCATIONS.DOME;
  if (umbrellaId >= 8 && umbrellaId <= 14) return LOCATIONS.SPORTS;
  if (umbrellaId >= 15 && umbrellaId <= 21) return LOCATIONS.CAFETERIA;
  throw new Error("Invalid umbrella ID");
}

export function getUmbrellasForLocation(location: Location): number[] {
  switch (location) {
    case LOCATIONS.DOME:
      return [1, 2, 3, 4, 5, 6, 7];
    case LOCATIONS.SPORTS:
      return [8, 9, 10, 11, 12, 13, 14];
    case LOCATIONS.CAFETERIA:
      return [15, 16, 17, 18, 19, 20, 21];
    default:
      return [];
  }
}
