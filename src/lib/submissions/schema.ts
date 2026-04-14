import { z } from "zod";
import { INQUIRY_TYPES } from "./types";

const base = z.object({
  inquiryType: z.enum(INQUIRY_TYPES),
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  licenseNumber: z.string().trim().max(80).optional().or(z.literal("")),
  address: z.string().trim().max(400).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Please include at least a sentence")
    .max(4000),
});

/**
 * Contact submission schema. When inquiry type is `dispensary-registration`,
 * license number and address become required.
 */
export const contactSubmissionSchema = base.superRefine((val, ctx) => {
  if (val.inquiryType === "dispensary-registration") {
    if (!val.licenseNumber || val.licenseNumber.length < 3) {
      ctx.addIssue({
        code: "custom",
        path: ["licenseNumber"],
        message: "OBNDD license number required for dispensary registration",
      });
    }
    if (!val.address || val.address.length < 5) {
      ctx.addIssue({
        code: "custom",
        path: ["address"],
        message: "Dispensary address required for registration",
      });
    }
  }
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
