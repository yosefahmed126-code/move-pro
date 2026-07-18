import { z } from "zod";

export const packageSchema = z.object({
  name: z.string().min(2, "Package name is required"),
  sessions: z.number().min(1, "Sessions must be at least 1"),
  price: z.number().min(0, "Price must be 0 or more"),
  allowedExcuses: z.number().min(0),
});