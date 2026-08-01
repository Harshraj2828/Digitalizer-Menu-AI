import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Restaurant, Menu, MenuSection, MenuItem } from "@/lib/api-client";

const DB_FILE = path.join(process.cwd(), "src/lib/mock-db.json");

interface MockSchema {
  restaurants: Restaurant[];
  menus: (Menu & { sections: (MenuSection & { items: MenuItem[] })[] })[];
}

function getInitialData(): MockSchema {
  const defaultRestaurantId = "r1";
  const defaultMenuId = "m1";

  const defaultPasswordHash = crypto.createHmac("sha256", "digidish-salt-123456789").update("password123").digest("hex");

  const defaultRestaurant: Restaurant = {
    id: defaultRestaurantId,
    ownerId: "default-owner",
    name: "Spice Symphony",
    address: "123 Gourmet Blvd, Foodie Haven",
    phone: "+1 555-0199",
    ownerName: "Chef Spice",
    email: "chef@spicesymphony.com",
    mobileNumber: "+1 555-0199",
    passwordHash: defaultPasswordHash,
    gstNumber: "22AAAAA0000A1Z5",
    qrCodeUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const defaultMenu: Menu & { sections: (MenuSection & { items: MenuItem[] })[] } = {
    id: defaultMenuId,
    restaurantId: defaultRestaurantId,
    title: "Spice Symphony Menu",
    sourceImageUrl: null,
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: "s1",
        menuId: defaultMenuId,
        name: "Starters",
        displayOrder: 1,
        items: [
          {
            id: "i1",
            sectionId: "s1",
            name: "Paneer Tikka",
            description: "Char-grilled cottage cheese cubes marinated in yogurt and spices",
            price: 249,
            currency: "INR",
            isVeg: true,
            isAvailable: true,
            imageUrl: null,
            displayOrder: 1,
          },
          {
            id: "i2",
            sectionId: "s1",
            name: "Chicken Seekh Kebab",
            description: "Skewered minced chicken seasoned with herbs and grilled in tandoor",
            price: 299,
            currency: "INR",
            isVeg: false,
            isAvailable: true,
            imageUrl: null,
            displayOrder: 2,
          },
        ],
      },
      {
        id: "s2",
        menuId: defaultMenuId,
        name: "Main Course",
        displayOrder: 2,
        items: [
          {
            id: "i3",
            sectionId: "s2",
            name: "Paneer Butter Masala",
            description: "Cottage cheese cubes cooked in a rich, creamy tomato gravy",
            price: 349,
            currency: "INR",
            isVeg: true,
            isAvailable: true,
            imageUrl: null,
            displayOrder: 1,
          },
          {
            id: "i4",
            sectionId: "s2",
            name: "Butter Chicken",
            description: "Tandoori chicken pieces simmered in a velvety butter tomato sauce",
            price: 389,
            currency: "INR",
            isVeg: false,
            isAvailable: true,
            imageUrl: null,
            displayOrder: 2,
          },
        ],
      },
      {
        id: "s3",
        menuId: defaultMenuId,
        name: "Beverages",
        displayOrder: 3,
        items: [
          {
            id: "i5",
            sectionId: "s3",
            name: "Mango Lassi",
            description: "Traditional yogurt based drink blended with sweet mango pulp",
            price: 99,
            currency: "INR",
            isVeg: true,
            isAvailable: true,
            imageUrl: null,
            displayOrder: 1,
          },
          {
            id: "i6",
            sectionId: "s3",
            name: "Masala Chai",
            description: "Brewed black tea with a mixture of aromatic Indian spices and herbs",
            price: 49,
            currency: "INR",
            isVeg: true,
            isAvailable: true,
            imageUrl: null,
            displayOrder: 2,
          },
        ],
      },
    ],
  };

  return {
    restaurants: [defaultRestaurant],
    menus: [defaultMenu],
  };
}

export function readMockDB(): MockSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const data = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
      return data;
    }
    const content = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading mock DB:", error);
    return getInitialData();
  }
}

export function writeMockDB(data: MockSchema) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing mock DB:", error);
  }
}

export const mockDb = {
  getRestaurants: () => {
    const db = readMockDB();
    return db.restaurants;
  },

  getRestaurant: (id: string) => {
    const db = readMockDB();
    return db.restaurants.find((r) => r.id === id) || null;
  },

  createRestaurant: (
    name: string,
    ownerName: string,
    email: string,
    mobileNumber: string,
    passwordHash: string,
    address?: string,
    gstNumber?: string
  ) => {
    const db = readMockDB();
    const newRestaurant: Restaurant = {
      id: "r-" + Math.random().toString(36).substring(2, 9),
      ownerId: "owner-" + Math.random().toString(36).substring(2, 9),
      name,
      address: address || null,
      phone: mobileNumber,
      ownerName,
      email,
      mobileNumber,
      passwordHash,
      gstNumber: gstNumber || null,
      qrCodeUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.restaurants.push(newRestaurant);
    writeMockDB(db);
    return newRestaurant;
  },

  getRestaurantByEmail: (email: string) => {
    const db = readMockDB();
    return db.restaurants.find((r) => r.email === email) || null;
  },

  updateRestaurant: (id: string, updates: Partial<Restaurant>) => {
    const db = readMockDB();
    const idx = db.restaurants.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Restaurant not found");
    db.restaurants[idx] = { ...db.restaurants[idx], ...updates, updatedAt: new Date().toISOString() };
    writeMockDB(db);
    return db.restaurants[idx];
  },

  getRestaurantMenus: (restaurantId: string) => {
    const db = readMockDB();
    return db.menus
      .filter((m) => m.restaurantId === restaurantId)
      .map(({ id, restaurantId, title, sourceImageUrl, status, createdAt, updatedAt, sections }) => ({
        id,
        restaurantId,
        title,
        sourceImageUrl,
        status,
        createdAt,
        updatedAt,
        sections,
      }));
  },

  getMenu: (id: string) => {
    const db = readMockDB();
    return db.menus.find((m) => m.id === id) || null;
  },

  createMenu: (restaurantId: string, title: string, sourceImageUrl: string | null = null, status: "processing" | "ready" | "published" = "processing") => {
    const db = readMockDB();
    const newMenu: Menu & { sections: (MenuSection & { items: MenuItem[] })[] } = {
      id: "m-" + Math.random().toString(36).substring(2, 9),
      restaurantId,
      title,
      sourceImageUrl,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: [],
    };
    db.menus.push(newMenu);
    writeMockDB(db);
    return newMenu;
  },

  updateMenu: (
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
  ) => {
    const db = readMockDB();
    const menuIndex = db.menus.findIndex((m) => m.id === id);
    if (menuIndex === -1) throw new Error("Menu not found");

    const existingMenu = db.menus[menuIndex];
    
    // Map payload to database structure
    const updatedSections = payload.sections.map((sect, sectIdx) => {
      const sectionId = sect.id || "s-" + Math.random().toString(36).substring(2, 9);
      const items = sect.items.map((item, itemIdx) => {
        return {
          id: item.id || "i-" + Math.random().toString(36).substring(2, 9),
          sectionId,
          name: item.name,
          description: item.description,
          price: item.price,
          currency: item.currency || "INR",
          isVeg: item.isVeg,
          isAvailable: item.isAvailable,
          imageUrl: item.imageUrl || null,
          displayOrder: item.displayOrder ?? itemIdx,
        };
      });

      return {
        id: sectionId,
        menuId: id,
        name: sect.name,
        displayOrder: sect.displayOrder ?? sectIdx,
        items,
      };
    });

    db.menus[menuIndex] = {
      ...existingMenu,
      title: payload.title,
      status: "ready", // Automatically mark ready if updated
      updatedAt: new Date().toISOString(),
      sections: updatedSections,
    };

    writeMockDB(db);
    return db.menus[menuIndex];
  },

  publishMenu: (id: string) => {
    const db = readMockDB();
    const menuIndex = db.menus.findIndex((m) => m.id === id);
    if (menuIndex === -1) throw new Error("Menu not found");
    db.menus[menuIndex].status = "published";
    db.menus[menuIndex].updatedAt = new Date().toISOString();
    writeMockDB(db);
    return db.menus[menuIndex];
  },
};
