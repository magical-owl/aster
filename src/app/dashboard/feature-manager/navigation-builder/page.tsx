"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import * as Icons from "lucide-react";
import { useToast } from "@/lib/toast";

interface NavItem {
  id: string;
  name: string;
  icon: string;
  type: "page" | "container";
  url?: string;
  children: NavItem[];
  expanded: boolean;
}

interface AccessItem {
  id: string;
  name: string;
  permissions: {
    view: boolean;
    edit: boolean;
    create: boolean;
    delete: boolean;
  };
  children: AccessItem[];
  expanded: boolean;
}

interface NewItemDialog {
  type: "root" | "child";
  parentId?: string;
}

const commonIcons = [
  "Home",
  "Settings",
  "Users",
  "User",
  "Shield",
  "Folder",
  "Layout",
  "SquareStack",
  "Building",
  "Calendar",
  "Clock",
  "FileText",
  "CreditCard",
  "Briefcase",
  "BookOpen",
  "PieChart",
  "BarChart",
  "Bell",
  "Mail",
  "MessageSquare",
  "HelpCircle",
  "Settings2",
  "Sliders",
  "Lock",
  "Unlock",
  "Database",
  "Globe",
  "Link",
  "Image",
  "Camera",
  "Video",
  "Music",
  "Download",
  "Upload",
  "Plus",
  "Minus",
  "Edit",
  "Trash2",
  "Check",
  "X",
  "ChevronDown",
  "ChevronRight",
  "Circle",
  "Square",
  "Star",
  "Heart",
  "Zap",
  "Sun",
  "Moon",
  "Cloud",
  "MapPin",
  "Phone",
];

const initialNavigation: NavItem[] = [
  {
    id: "1",
    name: "Dashboard",
    icon: "Home",
    type: "page",
    url: "/dashboard",
    children: [],
    expanded: true,
  },
  {
    id: "2",
    name: "Access & Navigation",
    icon: "Settings",
    type: "container",
    children: [
      {
        id: "2-1",
        name: "Features",
        icon: "SquareStack",
        type: "page",
        url: "/dashboard/feature-manager",
        children: [],
        expanded: true,
      },
      {
        id: "2-2",
        name: "Navigation Builder",
        icon: "Layout",
        type: "page",
        url: "/dashboard/feature-manager/navigation-builder",
        children: [],
        expanded: true,
      },
      {
        id: "2-3",
        name: "Role Mapping",
        icon: "Shield",
        type: "page",
        url: "/dashboard/feature-manager/roles",
        children: [],
        expanded: true,
      },
    ],
    expanded: true,
  },
  {
    id: "3",
    name: "Management",
    icon: "Folder",
    type: "container",
    children: [
      {
        id: "3-1",
        name: "Users",
        icon: "Users",
        type: "page",
        url: "/dashboard/users",
        children: [],
        expanded: true,
      },
      {
        id: "3-2",
        name: "Brands",
        icon: "Building",
        type: "page",
        url: "/dashboard/brands",
        children: [],
        expanded: true,
      },
      {
        id: "3-3",
        name: "Teams",
        icon: "Users",
        type: "page",
        url: "/dashboard/teams",
        children: [],
        expanded: true,
      },
    ],
    expanded: true,
  },
];

/** Deep-clone a nav item to an access item with default view=true permissions */
function navToAccessItem(
  item: NavItem,
  existingAccess?: AccessItem[],
): AccessItem {
  const existing = existingAccess?.find((a) => a.id === item.id);
  return {
    id: item.id,
    name: item.name,
    permissions: {
      view: true,
      edit: existing?.permissions.edit ?? false,
      create: existing?.permissions.create ?? false,
      delete: existing?.permissions.delete ?? false,
    },
    children: item.children.map((child) =>
      navToAccessItem(child, existing?.children ?? []),
    ),
    expanded: item.expanded,
  };
}

/** Sync the access structure to mirror the navigation structure,
 *  preserving any existing permission values by id. */
function syncAccessFromNavigation(
  nav: NavItem[],
  currentAccess?: AccessItem[],
): AccessItem[] {
  return nav.map((item) => navToAccessItem(item, currentAccess));
}

export default function NavigationBuilderPage() {
  const { addToast } = useToast();
  const [navigation, setNavigation] = useState<NavItem[]>(initialNavigation);
  const [accessStructure, setAccessStructure] = useState<AccessItem[]>(() =>
    syncAccessFromNavigation(initialNavigation),
  );
  const [activeItem, setActiveItem] = useState<string>("1");
  const [showAddMenu, setShowAddMenu] = useState<string | null>(null);
  const [newItemDialog, setNewItemDialog] = useState<NewItemDialog | null>(
    null,
  );
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState<"page" | "container">(
    "container",
  );
  const [selectedIcon, setSelectedIcon] = useState("Folder");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [iconSearch, setIconSearch] = useState("");
  const [pageFeatures, setPageFeatures] = useState<any[]>([]);
  const [containers, setContainers] = useState<any[]>([]);
  const [selectedSourceItem, setSelectedSourceItem] = useState<string>("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  /** Helper to set both navigation and sync access structure */
  const setNavAndAccess = useCallback(
    (navUpdater: NavItem[] | ((prev: NavItem[]) => NavItem[])) => {
      setNavigation((prevNav) => {
        const nextNav =
          typeof navUpdater === "function" ? navUpdater(prevNav) : navUpdater;
        // Use a functional updater for access so we get the latest value
        setAccessStructure((prevAccess) =>
          syncAccessFromNavigation(nextNav, prevAccess),
        );
        return nextNav;
      });
    },
    [],
  );

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.Circle;
    return <Icon className="w-5 h-5" />;
  };

  const toggleExpand = (itemId: string, source: "nav" | "access") => {
    if (source === "nav") {
      const updateItem = (items: NavItem[]): NavItem[] =>
        items.map((item) =>
          item.id === itemId
            ? { ...item, expanded: !item.expanded }
            : { ...item, children: updateItem(item.children) },
        );
      setNavAndAccess(updateItem(navigation));
    } else {
      const updateItem = (items: AccessItem[]): AccessItem[] =>
        items.map((item) =>
          item.id === itemId
            ? { ...item, expanded: !item.expanded }
            : { ...item, children: updateItem(item.children) },
        );
      setAccessStructure(updateItem(accessStructure));
    }
  };

  const createNewItem = () => {
    if (!newItemName.trim()) return;

    const newItem: NavItem = {
      id: String(Date.now()),
      name: newItemName.trim(),
      icon: selectedIcon,
      type: newItemType,
      url: newItemType === "page" ? "" : undefined,
      children: [],
      expanded: true,
    };

    if (newItemDialog?.type === "root") {
      setNavAndAccess([...navigation, newItem]);
    } else if (newItemDialog?.type === "child" && newItemDialog.parentId) {
      const addToParent = (items: NavItem[]): NavItem[] =>
        items.map((item) =>
          item.id === newItemDialog.parentId
            ? { ...item, expanded: true, children: [...item.children, newItem] }
            : { ...item, children: addToParent(item.children) },
        );
      setNavAndAccess(addToParent(navigation));
    }

    setNewItemDialog(null);
    setNewItemName("");
    setSelectedIcon("Folder");
    setShowAddMenu(null);
    addToast(
      `${newItemType === "container" ? "Container" : "Page item"} created successfully`,
      "success",
    );
  };

  const updateItem = (itemId: string) => {
    if (!editName.trim()) return;

    const updateValues = (items: NavItem[]): NavItem[] =>
      items.map((item) =>
        item.id === itemId
          ? { ...item, name: editName.trim(), icon: editIcon }
          : { ...item, children: updateValues(item.children) },
      );

    setNavAndAccess(updateValues(navigation));
    setEditingItem(null);
    setEditName("");
    setEditIcon("");
  };

  const deleteItem = (itemId: string) => {
    const removeItem = (items: NavItem[]): NavItem[] =>
      items
        .filter((item) => item.id !== itemId)
        .map((item) => ({ ...item, children: removeItem(item.children) }));

    setNavAndAccess(removeItem(navigation));
    addToast("Navigation item deleted", "success");
  };

  /** Update a single permission on an access item */
  const toggleAccessPermission = (
    itemId: string,
    perm: "view" | "edit" | "create" | "delete",
  ) => {
    const updatePerm = (items: AccessItem[]): AccessItem[] =>
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              permissions: {
                ...item.permissions,
                [perm]: !item.permissions[perm],
              },
            }
          : { ...item, children: updatePerm(item.children) },
      );
    setAccessStructure(updatePerm(accessStructure));
  };

  /** Delete an item from *both* nav and access */
  const deleteAccessItem = (itemId: string) => {
    const removeItem = (items: NavItem[]): NavItem[] =>
      items
        .filter((item) => item.id !== itemId)
        .map((item) => ({ ...item, children: removeItem(item.children) }));

    setNavAndAccess(removeItem(navigation));
    addToast("Access item deleted", "success");
  };

  const copyToClipboard = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    addToast("JSON copied to clipboard", "success");
  };

  // Load dropdown options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [featuresRes, containersRes, templatesRes] = await Promise.all([
          fetch("/api/feature-manager/navigation/features"),
          fetch("/api/feature-manager/navigation/containers"),
          fetch("/api/feature-manager/navigation/templates"),
        ]);

        const features = await featuresRes.json();
        const containersData = await containersRes.json();
        const templatesData = await templatesRes.json();

        setPageFeatures(features);
        setContainers(containersData);
        setTemplates(templatesData);
      } catch (error) {
        console.error("Failed to load dropdown options:", error);
      }
    };

    loadOptions();
  }, []);

  // Load template when selected
  useEffect(() => {
    if (!selectedTemplateId) return;

    const loadTemplate = async () => {
      try {
        const res = await fetch(
          `/api/feature-manager/navigation/templates/${selectedTemplateId}`,
        );
        const navigationData = await res.json();
        // Set nav and rebuild access from the loaded template data
        setNavigation(navigationData);
        setAccessStructure(syncAccessFromNavigation(navigationData));
        addToast("Template loaded successfully", "success");
      } catch (error) {
        console.error("Failed to load template:", error);
        addToast("Failed to load template", "error");
      }
    };

    loadTemplate();
  }, [selectedTemplateId, addToast]);

  // Save template function
  const saveTemplate = async () => {
    if (!selectedTemplateId) {
      addToast("Please select a template first", "warning");
      return;
    }

    try {
      await fetch(
        `/api/feature-manager/navigation/templates/${selectedTemplateId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ navigation }),
        },
      );

      addToast("Template saved successfully", "success");
    } catch (error) {
      console.error("Failed to save template:", error);
      addToast("Failed to save template", "error");
    }
  };

  const filteredIcons = commonIcons.filter((icon) =>
    icon.toLowerCase().includes(iconSearch.toLowerCase()),
  );

  const renderIconPicker = (
    currentIcon: string,
    onSelect: (icon: string) => void,
    showSearch: boolean = true,
  ) => (
    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 bg-zinc-50 dark:bg-zinc-900/50">
      {showSearch && (
        <input
          type="text"
          placeholder="Search icons..."
          value={iconSearch}
          onChange={(e) => setIconSearch(e.target.value)}
          className="w-full px-3 py-1.5 mb-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-sm text-zinc-900 dark:text-zinc-100"
        />
      )}
      <div className="grid grid-cols-8 gap-1 max-h-[180px] overflow-y-auto">
        {filteredIcons.map((iconName) => {
          const Icon = (Icons as any)[iconName] || Icons.Circle;
          const isSelected = currentIcon === iconName;
          return (
            <button
              key={iconName}
              onClick={() => onSelect(iconName)}
              className={`p-2 rounded-md transition-colors ${
                isSelected
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                  : "hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const isActive = activeItem === item.id;
    const isEditing = editingItem === item.id;

    if (isEditing) {
      return (
        <div key={item.id} style={{ marginLeft: `${depth * 28}px` }}>
          <div className="flex flex-col gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <input
              type="text"
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateItem(item.id)}
              className="w-full px-2 py-1.5 bg-white dark:bg-zinc-800 border border-blue-300 dark:border-blue-700 rounded text-sm text-zinc-900 dark:text-zinc-100"
              placeholder="Item name"
            />
            {renderIconPicker(editIcon, setEditIcon, false)}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => updateItem(item.id)}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setEditName("");
                  setEditIcon("");
                }}
                className="px-3 py-1 bg-zinc-500 hover:bg-zinc-600 text-white rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={item.id} className="group">
        <div
          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${isActive ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-zinc-100 dark:hover:bg-zinc-700"}`}
          style={{ marginLeft: `${depth * 28}px` }}
          onClick={() => setActiveItem(item.id)}
        >
          <div className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded cursor-grab">
            <Icons.GripVertical className="w-4 h-4 text-zinc-400" />
          </div>

          {item.type === "container" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(item.id, "nav");
              }}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded"
            >
              <Icons.ChevronDown
                className={`w-4 h-4 text-zinc-500 ${item.expanded ? "" : "-rotate-90"} transition-transform`}
              />
            </button>
          )}

          <span
            className={
              isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-zinc-600 dark:text-zinc-300"
            }
          >
            {getIcon(item.icon)}
          </span>

          <span
            className={`flex-1 text-sm font-medium ${isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-900 dark:text-zinc-100"}`}
          >
            {item.name}
          </span>

          <div className="relative flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {item.type === "container" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddMenu(showAddMenu === item.id ? null : item.id);
                }}
                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-zinc-500 hover:text-blue-600"
                title="Add child item"
              >
                <Icons.Plus className="w-4 h-4" />
              </button>
            )}

            {showAddMenu === item.id && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-1 min-w-[160px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewItemDialog({ type: "child", parentId: item.id });
                    setNewItemType("page");
                    setNewItemName("");
                    setSelectedIcon("Circle");
                    setIconSearch("");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-left text-zinc-700 dark:text-zinc-300"
                >
                  <Icons.Link className="w-4 h-4" />
                  Add Page Item
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewItemDialog({ type: "child", parentId: item.id });
                    setNewItemType("container");
                    setNewItemName("");
                    setSelectedIcon("Folder");
                    setIconSearch("");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded text-left text-zinc-700 dark:text-zinc-300"
                >
                  <Icons.Folder className="w-4 h-4" />
                  Add Container
                </button>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingItem(item.id);
                setEditName(item.name);
                setEditIcon(item.icon);
                setIconSearch("");
              }}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded text-zinc-500 hover:text-zinc-700"
              title="Edit item"
            >
              <Icons.Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteItem(item.id);
              }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-zinc-500 hover:text-red-600"
              title="Delete item"
            >
              <Icons.Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {item.type === "container" &&
          item.expanded &&
          item.children.length > 0 && (
            <div>
              {item.children.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
      </div>
    );
  };

  const renderPreviewItem = (item: NavItem, depth: number = 0) => {
    const isActive = activeItem === item.id;

    return (
      <div key={item.id}>
        {item.type === "container" ? (
          <div className="mt-1">
            <div
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
              onClick={() => toggleExpand(item.id, "nav")}
            >
              <span
                className={
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-zinc-500 dark:text-zinc-400"
                }
              >
                {getIcon(item.icon)}
              </span>
              <span className="flex-1">{item.name}</span>
              <Icons.ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${item.expanded ? "rotate-180" : ""}`}
              />
            </div>

            {item.expanded && (
              <div className="ml-3 pl-4 border-l border-zinc-200 dark:border-zinc-700 space-y-1 mt-1">
                {item.children.map((child) =>
                  renderPreviewItem(child, depth + 1),
                )}
              </div>
            )}
          </div>
        ) : (
          <div
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
              isActive
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
            onClick={() => setActiveItem(item.id)}
          >
            <span
              className={
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-400 dark:text-zinc-500"
              }
            >
              {getIcon(item.icon)}
            </span>
            <span>{item.name}</span>
          </div>
        )}
      </div>
    );
  };

  /** Render access structure item with icon-based toggles (👁️ ✏️ ➕ 🗑️) */
  const renderAccessItem = (item: AccessItem, depth: number = 0) => {
    const p = item.permissions;
    const iconClass = (active: boolean, color: string) =>
      `w-3.5 h-3.5 ${active ? color : "text-zinc-300 dark:text-zinc-600"}`;

    return (
      <div key={item.id} className="group">
        <div
          className="flex items-center gap-1.5 p-1.5 rounded-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
          style={{ marginLeft: `${depth * 28}px` }}
        >
          {item.children.length > 0 ? (
            <button
              onClick={() => toggleExpand(item.id, "access")}
              className="p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded shrink-0"
            >
              <Icons.ChevronDown
                className={`w-3.5 h-3.5 text-zinc-500 ${item.expanded ? "" : "-rotate-90"} transition-transform`}
              />
            </button>
          ) : (
            <div className="w-4 shrink-0" />
          )}

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleAccessPermission(item.id, "view");
              }}
              title="Toggle View"
              className="p-0.5 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <Icons.Eye
                className={iconClass(
                  p.view,
                  "text-green-600 dark:text-green-400",
                )}
              />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleAccessPermission(item.id, "edit");
              }}
              title="Toggle Edit"
              className="p-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Icons.Pencil
                className={iconClass(
                  p.edit,
                  "text-blue-600 dark:text-blue-400",
                )}
              />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleAccessPermission(item.id, "create");
              }}
              title="Toggle Create"
              className="p-0.5 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <Icons.PlusCircle
                className={iconClass(
                  p.create,
                  "text-purple-600 dark:text-purple-400",
                )}
              />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleAccessPermission(item.id, "delete");
              }}
              title="Toggle Delete"
              className="p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Icons.Trash2
                className={iconClass(
                  p.delete,
                  "text-red-600 dark:text-red-400",
                )}
              />
            </button>
          </div>

          <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate min-w-0 ml-1">
            {item.name}
          </span>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteAccessItem(item.id);
              }}
              className="p-0.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-zinc-400 hover:text-red-600"
              title="Delete from access structure"
            >
              <Icons.Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {item.children.length > 0 && item.expanded && (
          <div>
            {item.children.map((child) => renderAccessItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout
      title="Navigation Builder"
      subtitle="Build and preview your navigation structure"
      icon={<Icons.Layout className="w-6 h-6 text-white" />}
    >
      {/* New Item Dialog */}
      {newItemDialog && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
          onClick={() => setNewItemDialog(null)}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-xl p-6 w-[480px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Add new item
            </h3>

            <div className="mb-4">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                Item Type
              </label>
              <select
                value={newItemType}
                onChange={(e) => {
                  setNewItemType(e.target.value as "page" | "container");
                  setSelectedSourceItem("");
                  setNewItemName("");
                  setSelectedIcon(
                    e.target.value === "container" ? "Folder" : "Circle",
                  );
                }}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
              >
                <option value="container">Container</option>
                <option value="page">Page Item</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                {newItemType === "container"
                  ? "Select Container"
                  : "Select Page"}
              </label>
              <select
                value={selectedSourceItem}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setSelectedSourceItem(selectedId);

                  if (newItemType === "page") {
                    const feature = pageFeatures.find(
                      (f) => f.id === selectedId,
                    );
                    if (feature) setNewItemName(feature.name);
                  } else {
                    const container = containers.find(
                      (c) => c.id === selectedId,
                    );
                    if (container) {
                      setNewItemName(container.name);
                      if (container.icon) setSelectedIcon(container.icon);
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100"
              >
                <option value="">-- Select --</option>
                {newItemType === "page"
                  ? pageFeatures.map((feature) => (
                      <option key={feature.id} value={feature.id}>
                        {feature.name}
                      </option>
                    ))
                  : containers.map((container) => (
                      <option key={container.id} value={container.id}>
                        {container.name}
                      </option>
                    ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                Icon
              </label>
              {renderIconPicker(selectedIcon, setSelectedIcon)}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setNewItemDialog(null)}
                className="px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNewItem}
                disabled={!newItemName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Row: Navigation Structure | Live Preview | Access Structure */}
      <div className="grid grid-cols-3 gap-6">
        {/* ─── Navigation Structure ─── */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Navigation Structure
              </h3>
              <button
                onClick={() => {
                  setNewItemDialog({ type: "root" });
                  setNewItemType("container");
                  setNewItemName("");
                  setSelectedIcon("Folder");
                  setIconSearch("");
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Icons.Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">
                Select Template
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-zinc-100"
              >
                <option value="">-- Select Template --</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-y-auto min-h-0">
            <div className="space-y-1">
              {navigation.map((item) => renderNavItem(item))}
            </div>
          </div>

          <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50 flex justify-end gap-3">
            <button
              onClick={() => {
                setNavigation(initialNavigation);
                setAccessStructure(syncAccessFromNavigation(initialNavigation));
              }}
              className="px-4 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={saveTemplate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Save Template
            </button>
          </div>
        </div>
        {/* ─── Access Structure ─── */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Access Structure
              </h3>
              <button
                onClick={() => {
                  setNewItemDialog({ type: "root" });
                  setNewItemType("container");
                  setNewItemName("");
                  setSelectedIcon("Folder");
                  setIconSearch("");
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Icons.Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-y-auto min-h-0">
            {accessStructure.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
                No items. Add items to the Navigation Structure to see them here
                with default permissions.
              </p>
            ) : (
              <div className="space-y-1">
                {accessStructure.map((item) => renderAccessItem(item))}
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50"></div>
        </div>

        {/* ─── Live Preview ─── */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Live Preview
              </h3>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-y-auto min-h-0">
            <div className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Icons.Layout className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    System
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Navigation Preview
                  </p>
                </div>
              </div>

              <nav className="p-2 space-y-1">
                {navigation.map((item) => renderPreviewItem(item))}
              </nav>
            </div>
          </div>

          <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50"></div>
        </div>
      </div>

      {/* Bottom Row: JSON Outputs */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* ─── JSON Output — Navigation Structure ─── */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              JSON Output — Navigation
            </h3>
            <button
              onClick={() => copyToClipboard(navigation)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Icons.Copy className="w-4 h-4" />
              Copy
            </button>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 max-h-[400px] overflow-y-auto">
            <pre className="text-xs font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-all">
              {JSON.stringify(navigation, null, 2)}
            </pre>
          </div>
        </div>

        {/* ─── JSON Output — Access Structure ─── */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              JSON Output — Access Structure
            </h3>
            <button
              onClick={() => copyToClipboard(accessStructure)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Icons.Copy className="w-4 h-4" />
              Copy
            </button>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 max-h-[400px] overflow-y-auto flex-1">
            <pre className="text-xs font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-all">
              {JSON.stringify(accessStructure, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
