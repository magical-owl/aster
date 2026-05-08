"use client";

import { Form } from "../form/Form";
import { AsyncSelect } from "../form/AsyncSelect";
import { SubmitButton } from "../form/SubmitButton";
import { CreateRoleNavigationSchema } from "@/lib/validations";
import type { z } from "zod";
import { Button } from "../ui/button";

type RoleNavigationFormData = z.infer<typeof CreateRoleNavigationSchema>;

interface RoleNavigationFormProps {
  initialData?: {
    roleId: string;
    navigationTemplateId: string;
    roleName?: string;
    templateName?: string;
  };
  onSubmit: (data: RoleNavigationFormData) => Promise<void>;
  onCancel: () => void;
  isEditMode?: boolean;
}

export default function RoleNavigationForm({
  initialData,
  onSubmit,
  onCancel,
  isEditMode = false,
}: RoleNavigationFormProps) {
  const defaultValues = {
    roleId: initialData?.roleId || "",
    navigationTemplateId: initialData?.navigationTemplateId || "",
  };

  return (
    <Form
      schema={CreateRoleNavigationSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      className="space-y-8"
    >
      <div className="bg-white dark:bg-zinc-800 px-6 py-5 shadow sm:rounded-lg sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-zinc-100 mb-4">
          {isEditMode ? "Edit Role Mapping" : "New Role Mapping"}
        </h3>
        <div className="grid grid-cols-1 gap-6">
          <AsyncSelect
            name="roleId"
            label="Role"
            endpoint="/api/roles"
            placeholder="Select role"
            required
            disabled={isEditMode}
          />

          <AsyncSelect
            name="navigationTemplateId"
            label="Navigation Template"
            endpoint="/api/feature-manager/navigation/templates"
            placeholder="Select navigation template"
            required
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <SubmitButton>{isEditMode ? "Update" : "Create"}</SubmitButton>
      </div>
    </Form>
  );
}
