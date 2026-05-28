import { z } from "zod";

export const createFeatureAccessTemplateSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  domain: z.string().min(1, "Domain is required"),
  scopeLevel: z.string().min(1, "Scope Level is required"),
  isSystem: z.boolean().default(false),
});

export const updateFeatureAccessTemplateSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  domain: z.string().min(1, "Domain is required"),
  scopeLevel: z.string().min(1, "Scope Level is required"),
  isSystem: z.boolean().default(false),
});
