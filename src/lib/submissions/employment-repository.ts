import type { EmploymentSubmissionInput } from "./employment-schema";

export interface EmploymentRowAtRest {
  id: string;
  firstName: string;
  lastName: string;
  /** AES-GCM ciphertext (base64). */
  dobEncrypted: string;
  phone: string;
  email: string | null;
  mailingAddress: string;
  isUsCitizen: boolean;
  isAuthorizedToWork: boolean | null;
  hasFelonyEncrypted: string;
  felonyExplanationEncrypted: string | null;
  education: EmploymentSubmissionInput["education"];
  militaryService: string | null;
  arrestsDisclosureEncrypted: string;
  createdAt: string;
}

export interface EmploymentRepository {
  insert(row: Omit<EmploymentRowAtRest, "id" | "createdAt">): Promise<EmploymentRowAtRest>;
}

export function createInMemoryEmploymentRepository(): EmploymentRepository & {
  rows: EmploymentRowAtRest[];
} {
  const rows: EmploymentRowAtRest[] = [];
  return {
    rows,
    async insert(input) {
      const row: EmploymentRowAtRest = {
        ...input,
        id: `emp-${rows.length + 1}`,
        createdAt: new Date().toISOString(),
      };
      rows.push(row);
      return row;
    },
  };
}
