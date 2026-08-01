import { z } from "zod";

// Zod schema matching the required AI extraction contract
export const MenuItemExtractionSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().default(""),
  price: z.number().nonnegative("Price must be a positive number"),
  isVeg: z.boolean().nullable().default(null),
});

export const MenuSectionExtractionSchema = z.object({
  name: z.string().min(1, "Section name is required"),
  items: z.array(MenuItemExtractionSchema),
});

export const MenuExtractionSchema = z.object({
  menuTitle: z.string().min(1, "Menu title is required"),
  currency: z.string().default("INR"),
  sections: z.array(MenuSectionExtractionSchema),
});

export type MenuItemExtraction = z.infer<typeof MenuItemExtractionSchema>;
export type MenuSectionExtraction = z.infer<typeof MenuSectionExtractionSchema>;
export type MenuExtraction = z.infer<typeof MenuExtractionSchema>;

// Full types matching database schema
export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  address: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  ownerName?: string;
  email?: string;
  mobileNumber?: string;
  passwordHash?: string;
  gstNumber?: string | null;
  qrCodeUrl?: string | null;
}

export interface MenuItem {
  id: string;
  sectionId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  isVeg: boolean | null;
  isAvailable: boolean;
  imageUrl: string | null;
  displayOrder: number;
}

export interface MenuSection {
  id: string;
  menuId: string;
  name: string;
  displayOrder: number;
  items: MenuItem[];
}

export interface Menu {
  id: string;
  restaurantId: string;
  title: string;
  sourceImageUrl: string | null;
  status: "processing" | "ready" | "published";
  createdAt: string;
  updatedAt: string;
  sections?: MenuSection[];
}

export class DigiDishClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private getHeaders() {
    return {
      "Content-Type": "application/json",
    };
  }

  async uploadMenu(
    restaurantId: string,
    fileBase64: string,
    fileName: string,
    title: string = "New Digitized Menu"
  ): Promise<{ success: boolean; menu: Menu }> {
    const response = await fetch(`${this.baseUrl}/api/menus/upload`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        restaurantId,
        file: fileBase64,
        fileName,
        title,
      }),
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getMenu(id: string): Promise<Menu & { sections: MenuSection[] }> {
    const response = await fetch(`${this.baseUrl}/api/menus/${id}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch menu: ${response.statusText}`);
    }

    return response.json();
  }

  async saveMenu(
    id: string,
    payload: {
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
    }
  ): Promise<{ success: boolean; menu: Menu }> {
    const response = await fetch(`${this.baseUrl}/api/menus/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to save menu: ${response.statusText}`);
    }

    return response.json();
  }

  async publishMenu(id: string): Promise<{ success: boolean; menu: Menu }> {
    const response = await fetch(`${this.baseUrl}/api/menus/${id}/publish`, {
      method: "POST",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to publish menu: ${response.statusText}`);
    }

    return response.json();
  }

  async getRestaurantMenus(restaurantId: string): Promise<Menu[]> {
    const response = await fetch(`${this.baseUrl}/api/restaurants/${restaurantId}/menus`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch restaurant menus: ${response.statusText}`);
    }

    return response.json();
  }

  async getRestaurants(): Promise<Restaurant[]> {
    const response = await fetch(`${this.baseUrl}/api/restaurants`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch restaurants: ${response.statusText}`);
    }

    return response.json();
  }

  async createRestaurant(name: string, address?: string, phone?: string): Promise<Restaurant> {
    const response = await fetch(`${this.baseUrl}/api/restaurants`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ name, address, phone }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create restaurant: ${response.statusText}`);
    }

    return response.json();
  }
}
