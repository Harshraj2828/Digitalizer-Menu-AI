import { prisma } from "./prisma";
import { mockDb } from "./mock-db";
import { Restaurant, Menu, MenuSection, MenuItem } from "@/lib/api-client";

export const db = {
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      const res = await prisma.restaurant.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.map((r) => ({
        id: r.id,
        ownerId: r.ownerId,
        name: r.name,
        address: r.address,
        phone: r.phone,
        ownerName: r.ownerName || undefined,
        email: r.email || undefined,
        mobileNumber: r.mobileNumber || undefined,
        gstNumber: r.gstNumber,
        qrCodeUrl: r.qrCodeUrl,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (e) {
      console.warn("Prisma getRestaurants failed, using mock DB:", (e as Error).message);
      return mockDb.getRestaurants();
    }
  },

  async getRestaurant(id: string): Promise<Restaurant | null> {
    try {
      const r = await prisma.restaurant.findUnique({
        where: { id },
      });
      if (!r) return null;
      return {
        id: r.id,
        ownerId: r.ownerId,
        name: r.name,
        address: r.address,
        phone: r.phone,
        ownerName: r.ownerName || undefined,
        email: r.email || undefined,
        mobileNumber: r.mobileNumber || undefined,
        gstNumber: r.gstNumber,
        qrCodeUrl: r.qrCodeUrl,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    } catch (e) {
      console.warn("Prisma getRestaurant failed, using mock DB:", (e as Error).message);
      return mockDb.getRestaurant(id);
    }
  },

  async getRestaurantByEmail(email: string): Promise<Restaurant | null> {
    try {
      const r = await prisma.restaurant.findUnique({
        where: { email },
      });
      if (!r) return null;
      return {
        id: r.id,
        ownerId: r.ownerId,
        name: r.name,
        address: r.address,
        phone: r.phone,
        ownerName: r.ownerName || undefined,
        email: r.email || undefined,
        mobileNumber: r.mobileNumber || undefined,
        passwordHash: r.passwordHash || undefined,
        gstNumber: r.gstNumber,
        qrCodeUrl: r.qrCodeUrl,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    } catch (e) {
      console.warn("Prisma getRestaurantByEmail failed, using mock DB:", (e as Error).message);
      return mockDb.getRestaurantByEmail(email);
    }
  },

  async createRestaurant(
    name: string,
    ownerName: string,
    email: string,
    mobileNumber: string,
    passwordHash: string,
    address?: string,
    gstNumber?: string
  ): Promise<Restaurant> {
    try {
      const r = await prisma.restaurant.create({
        data: {
          name,
          ownerName,
          email,
          mobileNumber,
          passwordHash,
          address: address || null,
          phone: mobileNumber,
          gstNumber: gstNumber || null,
          ownerId: "owner-" + Math.random().toString(36).substring(2, 9),
        },
      });
      return {
        id: r.id,
        ownerId: r.ownerId,
        name: r.name,
        address: r.address,
        phone: r.phone,
        ownerName: r.ownerName || undefined,
        email: r.email || undefined,
        mobileNumber: r.mobileNumber || undefined,
        gstNumber: r.gstNumber,
        qrCodeUrl: r.qrCodeUrl,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    } catch (e) {
      console.warn("Prisma createRestaurant failed, using mock DB:", (e as Error).message);
      return mockDb.createRestaurant(name, ownerName, email, mobileNumber, passwordHash, address, gstNumber);
    }
  },

  async updateRestaurant(id: string, updates: Partial<Restaurant>): Promise<Restaurant> {
    try {
      const r = await prisma.restaurant.update({
        where: { id },
        data: {
          name: updates.name,
          ownerName: updates.ownerName,
          address: updates.address,
          phone: updates.mobileNumber,
          mobileNumber: updates.mobileNumber,
          gstNumber: updates.gstNumber,
          qrCodeUrl: updates.qrCodeUrl,
        },
      });
      return {
        id: r.id,
        ownerId: r.ownerId,
        name: r.name,
        address: r.address,
        phone: r.phone,
        ownerName: r.ownerName || undefined,
        email: r.email || undefined,
        mobileNumber: r.mobileNumber || undefined,
        gstNumber: r.gstNumber,
        qrCodeUrl: r.qrCodeUrl,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    } catch (e) {
      console.warn("Prisma updateRestaurant failed, using mock DB:", (e as Error).message);
      return mockDb.updateRestaurant(id, updates);
    }
  },

  async getRestaurantMenus(restaurantId: string): Promise<Menu[]> {
    try {
      const menus = await prisma.menu.findMany({
        where: { restaurantId },
        orderBy: { createdAt: "desc" },
        include: {
          sections: {
            orderBy: { displayOrder: "asc" },
            include: {
              items: {
                orderBy: { displayOrder: "asc" },
              },
            },
          },
        },
      });
      return menus.map((m) => ({
        id: m.id,
        restaurantId: m.restaurantId,
        title: m.title,
        sourceImageUrl: m.sourceImageUrl,
        status: m.status as any,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
        sections: m.sections.map((sec) => ({
          id: sec.id,
          menuId: sec.menuId,
          name: sec.name,
          displayOrder: sec.displayOrder,
          items: sec.items.map((item) => ({
            id: item.id,
            sectionId: item.sectionId,
            name: item.name,
            description: item.description,
            price: item.price,
            currency: item.currency,
            isVeg: item.isVeg,
            isAvailable: item.isAvailable,
            imageUrl: item.imageUrl,
            displayOrder: item.displayOrder,
          })),
        })),
      }));
    } catch (e) {
      console.warn("Prisma getRestaurantMenus failed, using mock DB:", (e as Error).message);
      return mockDb.getRestaurantMenus(restaurantId);
    }
  },

  async getMenu(id: string): Promise<(Menu & { sections: MenuSection[] }) | null> {
    try {
      const menu = await prisma.menu.findUnique({
        where: { id },
        include: {
          sections: {
            orderBy: { displayOrder: "asc" },
            include: {
              items: {
                orderBy: { displayOrder: "asc" },
              },
            },
          },
        },
      });

      if (!menu) return null;

      return {
        id: menu.id,
        restaurantId: menu.restaurantId,
        title: menu.title,
        sourceImageUrl: menu.sourceImageUrl,
        status: menu.status as any,
        createdAt: menu.createdAt.toISOString(),
        updatedAt: menu.updatedAt.toISOString(),
        sections: menu.sections.map((sec) => ({
          id: sec.id,
          menuId: sec.menuId,
          name: sec.name,
          displayOrder: sec.displayOrder,
          items: sec.items.map((item) => ({
            id: item.id,
            sectionId: item.sectionId,
            name: item.name,
            description: item.description,
            price: item.price,
            currency: item.currency,
            isVeg: item.isVeg,
            isAvailable: item.isAvailable,
            imageUrl: item.imageUrl,
            displayOrder: item.displayOrder,
          })),
        })),
      };
    } catch (e) {
      console.warn("Prisma getMenu failed, using mock DB:", (e as Error).message);
      return mockDb.getMenu(id);
    }
  },

  async createMenu(
    restaurantId: string,
    title: string,
    sourceImageUrl: string | null = null,
    status: "processing" | "ready" | "published" = "processing"
  ): Promise<Menu & { sections: MenuSection[] }> {
    try {
      const m = await prisma.menu.create({
        data: {
          restaurantId,
          title,
          sourceImageUrl,
          status,
        },
      });
      return {
        id: m.id,
        restaurantId: m.restaurantId,
        title: m.title,
        sourceImageUrl: m.sourceImageUrl,
        status: m.status as any,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
        sections: [],
      };
    } catch (e) {
      console.warn("Prisma createMenu failed, using mock DB:", (e as Error).message);
      return mockDb.createMenu(restaurantId, title, sourceImageUrl, status);
    }
  },

  async updateMenu(
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
  ): Promise<Menu & { sections: MenuSection[] }> {
    try {
      // Perform database updates inside a Prisma transaction
      return await prisma.$transaction(async (tx) => {
        // Update menu title
        await tx.menu.update({
          where: { id },
          data: {
            title: payload.title,
            status: "ready", // Transition from processing to ready on save
          },
        });

        // Get current sections to check for deletions
        const existingSections = await tx.menuSection.findMany({
          where: { menuId: id },
        });

        const incomingSectionIds = payload.sections.map((s) => s.id).filter(Boolean) as string[];
        const sectionsToDelete = existingSections.filter((s) => !incomingSectionIds.includes(s.id));

        // Delete sections not in incoming payload (cascade handles items)
        if (sectionsToDelete.length > 0) {
          await tx.menuSection.deleteMany({
            where: { id: { in: sectionsToDelete.map((s) => s.id) } },
          });
        }

        // Upsert sections
        for (const sec of payload.sections) {
          const sectionId = sec.id || "temp-section-id";
          
          let dbSection;
          if (sec.id && existingSections.some(s => s.id === sec.id)) {
            // Update existing section
            dbSection = await tx.menuSection.update({
              where: { id: sec.id },
              data: {
                name: sec.name,
                displayOrder: sec.displayOrder,
              },
            });
          } else {
            // Create new section
            dbSection = await tx.menuSection.create({
              data: {
                menuId: id,
                name: sec.name,
                displayOrder: sec.displayOrder,
              },
            });
          }

          const currentItems = await tx.menuItem.findMany({
            where: { sectionId: dbSection.id },
          });

          const incomingItemIds = sec.items.map((i) => i.id).filter(Boolean) as string[];
          const itemsToDelete = currentItems.filter((i) => !incomingItemIds.includes(i.id));

          // Delete items
          if (itemsToDelete.length > 0) {
            await tx.menuItem.deleteMany({
              where: { id: { in: itemsToDelete.map((i) => i.id) } },
            });
          }

          // Upsert items
          for (const item of sec.items) {
            if (item.id && currentItems.some((i) => i.id === item.id)) {
              await tx.menuItem.update({
                where: { id: item.id },
                data: {
                  name: item.name,
                  description: item.description,
                  price: item.price,
                  currency: item.currency,
                  isVeg: item.isVeg,
                  isAvailable: item.isAvailable,
                  imageUrl: item.imageUrl,
                  displayOrder: item.displayOrder,
                },
              });
            } else {
              await tx.menuItem.create({
                data: {
                  sectionId: dbSection.id,
                  name: item.name,
                  description: item.description,
                  price: item.price,
                  currency: item.currency,
                  isVeg: item.isVeg,
                  isAvailable: item.isAvailable,
                  imageUrl: item.imageUrl,
                  displayOrder: item.displayOrder,
                },
              });
            }
          }
        }

        // Return updated menu
        const updatedMenu = await tx.menu.findUnique({
          where: { id },
          include: {
            sections: {
              orderBy: { displayOrder: "asc" },
              include: {
                items: {
                  orderBy: { displayOrder: "asc" },
                },
              },
            },
          },
        });

        if (!updatedMenu) throw new Error("Updated menu not found");

        return {
          id: updatedMenu.id,
          restaurantId: updatedMenu.restaurantId,
          title: updatedMenu.title,
          sourceImageUrl: updatedMenu.sourceImageUrl,
          status: updatedMenu.status as any,
          createdAt: updatedMenu.createdAt.toISOString(),
          updatedAt: updatedMenu.updatedAt.toISOString(),
          sections: updatedMenu.sections.map((sec) => ({
            id: sec.id,
            menuId: sec.menuId,
            name: sec.name,
            displayOrder: sec.displayOrder,
            items: sec.items.map((item) => ({
              id: item.id,
              sectionId: item.sectionId,
              name: item.name,
              description: item.description,
              price: item.price,
              currency: item.currency,
              isVeg: item.isVeg,
              isAvailable: item.isAvailable,
              imageUrl: item.imageUrl,
              displayOrder: item.displayOrder,
            })),
          })),
        };
      });
    } catch (e) {
      console.warn("Prisma updateMenu failed, using mock DB:", (e as Error).message);
      return mockDb.updateMenu(id, payload);
    }
  },

  async publishMenu(id: string): Promise<Menu> {
    try {
      const m = await prisma.menu.update({
        where: { id },
        data: { status: "published" },
      });
      return {
        id: m.id,
        restaurantId: m.restaurantId,
        title: m.title,
        sourceImageUrl: m.sourceImageUrl,
        status: m.status as any,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      };
    } catch (e) {
      console.warn("Prisma publishMenu failed, using mock DB:", (e as Error).message);
      return mockDb.publishMenu(id);
    }
  },
};
