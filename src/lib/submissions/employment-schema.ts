import { z } from "zod";

export const EDUCATION_LEVELS = [
  "less_than_high_school",
  "high_school",
  "some_college",
  "associate",
  "bachelor",
  "master",
  "doctorate",
] as const;

export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export const EDUCATION_LABELS: Record<EducationLevel, string> = {
  less_than_high_school: "Less than high school",
  high_school: "High school diploma or GED",
  some_college: "Some college, no degree",
  associate: "Associate degree",
  bachelor: "Bachelor’s degree",
  master: "Master’s degree",
  doctorate: "Doctorate",
};

const base = z.object({
  firstName: z.string().trim().min(1, "Required").max(120),
  lastName: z.string().trim().min(1, "Required").max(120),
  dob: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  phone: z.string().trim().min(7, "Required").max(40),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  mailingAddress: z.string().trim().min(5, "Required").max(400),
  isUsCitizen: z.enum(["yes", "no"]),
  isAuthorizedToWork: z.enum(["yes", "no"]).optional(),
  hasFelony: z.enum(["yes", "no"]),
  felonyExplanation: z.string().trim().max(2000).optional().or(z.literal("")),
  education: z.enum(EDUCATION_LEVELS),
  militaryService: z.string().trim().max(2000).optional().or(z.literal("")),
  arrestsDisclosure: z
    .string()
    .trim()
    .min(2, "Required — if none, enter NONE")
    .max(4000),
  certifiedTruthful: z.literal("on", {
    message: "You must certify the statement is truthful",
  }),
});

export const employmentSubmissionSchema = base.superRefine((val, ctx) => {
  if (val.isUsCitizen === "no" && !val.isAuthorizedToWork) {
    ctx.addIssue({
      code: "custom",
      path: ["isAuthorizedToWork"],
      message: "If not a US citizen, tell us whether you are authorized to work",
    });
  }
  if (val.hasFelony === "yes") {
    if (!val.felonyExplanation || val.felonyExplanation.length < 5) {
      ctx.addIssue({
        code: "custom",
        path: ["felonyExplanation"],
        message: "Please briefly explain",
      });
    }
  }
});

export type EmploymentSubmissionInput = z.infer<
  typeof employmentSubmissionSchema
>;
