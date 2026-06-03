export interface NavigationItemPermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
}

export interface NavigationItem {
  name: string;
  type: "page" | "container";
  alias?: string;
  icon?: string;
  code?: string;
  url?: string;
  id?: string | number;
  children?: NavigationItem[];
  permissions?: NavigationItemPermissions;
}

export interface UserNavigation {
  version: number;
  template: string;
  generatedAt: string;
  items: NavigationItem[];
}
