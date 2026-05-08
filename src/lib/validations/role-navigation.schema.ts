import { z } from "zod";

export const CreateRoleNavigationSchema = z.object({
  roleId: z.string().min(1, "Role is required"),
  navigationTemplateId: z.string().min(1, "Navigation template is required"),
});

export const UpdateRoleNavigationSchema = z.object({
  roleId: z.string().optional(),
  navigationTemplateId: z.string().min(1, "Navigation template is required"),
});

export type CreateRoleNavigationData = z.infer<
  typeof CreateRoleNavigationSchema
>;
export type UpdateRoleNavigationData = z.infer<
  typeof UpdateRoleNavigationSchema
>;
