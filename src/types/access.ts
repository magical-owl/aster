export interface AccessItem {
  id: string;
  templateId: string;
  featureCode: string;
  action: string;
  effect: "allow" | "deny";
  scopeLevel: string;
  scopeOverride?: string;
  createdAt: Date;
}

export interface AccessTemplate {
  id: string;
  code: string;
  name: string;
  description?: string;
  domain: string;
  scopeLevel: string;
  isSystem: boolean;
  archivedAt?: Date;
  archivedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  items: AccessItem[];
}

export interface AccessStructure {
  id: string;
  name: string;
  description?: string;
  domain: string;
  scopeLevel: string;
  isSystem: boolean;
  items: AccessItem[];
}
