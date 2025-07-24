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
  umbrellaId: z.number().min(1).max(21),
  location: z.enum([LOCATIONS.DOME, LOCATIONS.SPORTS, LOCATIONS.CAFETERIA])
});

export type BorrowForm = z.infer<typeof borrowFormSchema>;

// Return form schema
export const returnFormSchema = z.object({
  umbrellaId: z.number().min(1).max(21),
  returnLocation: z.enum([LOCATIONS.DOME, LOCATIONS.SPORTS, LOCATIONS.CAFETERIA]).optional()
});

export type ReturnForm = z.infer<typeof returnFormSchema>;

// Admin login schema
export const adminLoginSchema = z.object({
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน")
});

export type AdminLogin = z.infer<typeof adminLoginSchema>;

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
