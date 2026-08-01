import { create } from "zustand";
import { DigiDishClient, Restaurant, Menu, MenuSection, MenuItem } from "@/lib/api-client";

// Get base URL for client queries
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
};

const api = new DigiDishClient(getBaseUrl());

interface MenuStore {
  currentRestaurant: Restaurant | null;
  isDemoMode: boolean;
  restaurants: Restaurant[];
  selectedRestaurantId: string | null;
  menus: Menu[];
  activeMenu: (Menu & { sections: MenuSection[] }) | null;
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;

  // Authentication Actions
  login: (credentials: any) => Promise<boolean>;
  signup: (formData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: (isDemoQuery?: boolean) => Promise<boolean>;

  // Actions
  fetchRestaurants: () => Promise<void>;
  setSelectedRestaurantId: (id: string) => void;
  createRestaurant: (name: string, address?: string, phone?: string) => Promise<Restaurant>;
  fetchRestaurantMenus: (restaurantId: string) => Promise<void>;
  fetchMenuDetails: (id: string) => Promise<void>;
  uploadMenu: (restaurantId: string, fileBase64: string, fileName: string, title?: string) => Promise<Menu>;
  saveMenu: (id: string, payload: {
    title: string;
    sections: {
      id?: string;
      name: string;
      displayOrder: number;
      items: {
        id?: string;
        name: string;
        description: string;
        price: number;
        currency: string;
        isVeg: boolean | null;
        isAvailable: boolean;
        imageUrl?: string | null;
        displayOrder: number;
      }[];
    }[];
  }) => Promise<void>;
  publishMenu: (id: string) => Promise<void>;

  // Optimistic UI updates
  updateActiveMenuItem: (sectionId: string, itemId: string, updates: Partial<MenuItem>) => void;
  deleteActiveMenuItem: (sectionId: string, itemId: string) => void;
  addActiveMenuItem: (sectionId: string, item: Omit<MenuItem, "id" | "sectionId">) => void;
  updateActiveSectionName: (sectionId: string, name: string) => void;
  deleteActiveSection: (sectionId: string) => void;
  addActiveSection: (name: string) => void;
  reorderActiveSections: (sections: MenuSection[]) => void;
  reorderActiveItems: (sectionId: string, items: MenuItem[]) => void;
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  currentRestaurant: null,
  isDemoMode: false,
  restaurants: [],
  selectedRestaurantId: null,
  menus: [],
  activeMenu: null,
  isLoading: false,
  isProcessing: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to sign in.");
      }

      const data = await res.json();
      set({
        currentRestaurant: data.restaurant,
        selectedRestaurantId: data.restaurant.id,
        isDemoMode: false,
        isLoading: false,
      });
      get().fetchRestaurantMenus(data.restaurant.id);
      return true;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      return false;
    }
  },

  signup: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to sign up.");
      }

      const data = await res.json();
      set({
        currentRestaurant: data.restaurant,
        selectedRestaurantId: data.restaurant.id,
        isDemoMode: false,
        isLoading: false,
      });
      get().fetchRestaurantMenus(data.restaurant.id);
      return true;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    set({
      currentRestaurant: null,
      selectedRestaurantId: null,
      menus: [],
      restaurants: [],
      activeMenu: null,
      isDemoMode: false,
      isLoading: false,
    });
  },

  checkSession: async (isDemoQuery = false) => {
    if (isDemoQuery) {
      const defaultRestaurant: Restaurant = {
        id: "r1",
        ownerId: "default-owner",
        name: "Spice Symphony",
        address: "123 Gourmet Blvd, Foodie Haven",
        phone: "+1 555-0199",
        ownerName: "Chef Spice",
        email: "chef@spicesymphony.com",
        mobileNumber: "+1 555-0199",
        gstNumber: "22AAAAA0000A1Z5",
        qrCodeUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set({
        currentRestaurant: defaultRestaurant,
        selectedRestaurantId: defaultRestaurant.id,
        isDemoMode: true,
        restaurants: [defaultRestaurant],
      });
      get().fetchRestaurantMenus(defaultRestaurant.id);
      return true;
    }

    try {
      const res = await fetch("/api/auth/user");
      if (res.ok) {
        const data = await res.json();
        set({
          currentRestaurant: data.restaurant,
          selectedRestaurantId: data.restaurant.id,
          isDemoMode: data.isDemo || false,
          restaurants: [data.restaurant],
        });
        get().fetchRestaurantMenus(data.restaurant.id);
        return true;
      }
    } catch (err) {}

    set({ currentRestaurant: null, selectedRestaurantId: null });
    return false;
  },

  fetchRestaurants: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getRestaurants();
      set({
        restaurants: data,
        selectedRestaurantId: data.length > 0 ? data[0].id : null,
        isLoading: false,
      });
      if (data.length > 0) {
        get().fetchRestaurantMenus(data[0].id);
      }
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  setSelectedRestaurantId: (id: string) => {
    set({ selectedRestaurantId: id });
    get().fetchRestaurantMenus(id);
  },

  createRestaurant: async (name: string, address?: string, phone?: string) => {
    set({ isLoading: true, error: null });
    try {
      const newRest = await api.createRestaurant(name, address, phone);
      set((state) => ({
        restaurants: [newRest, ...state.restaurants],
        selectedRestaurantId: newRest.id,
        isLoading: false,
      }));
      get().fetchRestaurantMenus(newRest.id);
      return newRest;
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  fetchRestaurantMenus: async (restaurantId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getRestaurantMenus(restaurantId);
      set({ menus: data, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchMenuDetails: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getMenu(id);
      set({ activeMenu: data as any, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  uploadMenu: async (restaurantId: string, fileBase64: string, fileName: string, title?: string) => {
    set({ isProcessing: true, error: null });
    try {
      const result = await api.uploadMenu(restaurantId, fileBase64, fileName, title);
      set((state) => ({
        menus: [result.menu, ...state.menus],
        isProcessing: false,
      }));
      return result.menu;
    } catch (err) {
      set({ error: (err as Error).message, isProcessing: false });
      throw err;
    }
  },

  saveMenu: async (id: string, payload: {
    title: string;
    sections: {
      id?: string;
      name: string;
      displayOrder: number;
      items: {
        id?: string;
        name: string;
        description: string;
        price: number;
        currency: string;
        isVeg: boolean | null;
        isAvailable: boolean;
        imageUrl?: string | null;
        displayOrder: number;
      }[];
    }[];
  }) => {
    try {
      const result = await api.saveMenu(id, payload);
      set({ activeMenu: result.menu as any });
      const restId = get().selectedRestaurantId;
      if (restId) {
        get().fetchRestaurantMenus(restId);
      }
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  publishMenu: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.publishMenu(id);
      set((state) => ({
        menus: state.menus.map((m) => (m.id === id ? result.menu : m)),
        activeMenu: state.activeMenu?.id === id ? { ...state.activeMenu, status: "published" } : state.activeMenu,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  updateActiveMenuItem: (sectionId: string, itemId: string, updates: Partial<MenuItem>) => {
    set((state) => {
      if (!state.activeMenu) return {};
      const sections = state.activeMenu.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          items: sec.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
        };
      });
      return { activeMenu: { ...state.activeMenu, sections } };
    });
  },

  deleteActiveMenuItem: (sectionId: string, itemId: string) => {
    set((state) => {
      if (!state.activeMenu) return {};
      const sections = state.activeMenu.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          items: sec.items.filter((item) => item.id !== itemId),
        };
      });
      return { activeMenu: { ...state.activeMenu, sections } };
    });
  },

  addActiveMenuItem: (sectionId: string, item: Omit<MenuItem, "id" | "sectionId">) => {
    set((state) => {
      if (!state.activeMenu) return {};
      const sections = state.activeMenu.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const newItem: MenuItem = {
          ...item,
          id: "temp-" + Math.random().toString(36).substring(2, 9),
          sectionId,
        };
        return {
          ...sec,
          items: [...sec.items, newItem],
        };
      });
      return { activeMenu: { ...state.activeMenu, sections } };
    });
  },

  updateActiveSectionName: (sectionId: string, name: string) => {
    set((state) => {
      if (!state.activeMenu) return {};
      const sections = state.activeMenu.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, name } : sec
      );
      return { activeMenu: { ...state.activeMenu, sections } };
    });
  },

  deleteActiveSection: (sectionId: string) => {
    set((state) => {
      if (!state.activeMenu) return {};
      const sections = state.activeMenu.sections.filter((sec) => sec.id !== sectionId);
      return { activeMenu: { ...state.activeMenu, sections } };
    });
  },

  addActiveSection: (name: string) => {
    set((state) => {
      if (!state.activeMenu) return {};
      const newSec: MenuSection = {
        id: "temp-sec-" + Math.random().toString(36).substring(2, 9),
        menuId: state.activeMenu.id,
        name,
        displayOrder: state.activeMenu.sections.length + 1,
        items: [],
      };
      return {
        activeMenu: {
          ...state.activeMenu,
          sections: [...state.activeMenu.sections, newSec],
        },
      };
    });
  },

  reorderActiveSections: (sections: MenuSection[]) => {
    set((state) => {
      if (!state.activeMenu) return {};
      const updated = sections.map((sec, idx) => ({ ...sec, displayOrder: idx + 1 }));
      return { activeMenu: { ...state.activeMenu, sections: updated } };
    });
  },

  reorderActiveItems: (sectionId: string, items: MenuItem[]) => {
    set((state) => {
      if (!state.activeMenu) return {};
      const sections = state.activeMenu.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const updated = items.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
        return { ...sec, items: updated };
      });
      return { activeMenu: { ...state.activeMenu, sections } };
    });
  },
}));
