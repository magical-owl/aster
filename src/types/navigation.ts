export interface NavigationItem {
  name: string;
  type: "page" | "container";
  alias?: string;
  icon?: string;
  code?: string;
  url?: string;
  id?: string | number;
  children?: NavigationItem[];
}

export interface UserNavigation {
  version: number;
  template: string;
  generatedAt: string;
  items: NavigationItem[];
}
