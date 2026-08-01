const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed script...");
  
  // Clear tables
  try {
    await prisma.menuItem.deleteMany({});
    await prisma.menuSection.deleteMany({});
    await prisma.menu.deleteMany({});
    await prisma.restaurant.deleteMany({});
    console.log("Cleaned existing database records.");
  } catch (err) {
    console.warn("Table clearing failed (probably tables do not exist yet):", err.message);
  }

  // Create restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      id: "r1",
      ownerId: "default-owner",
      name: "Spice Symphony",
      address: "123 Gourmet Blvd, Foodie Haven",
      phone: "+1 555-0199",
    },
  });
  console.log("Created restaurant: Spice Symphony");

  // Create menu
  const menu = await prisma.menu.create({
    data: {
      id: "m1",
      restaurantId: restaurant.id,
      title: "Spice Symphony Menu",
      status: "published",
    },
  });
  console.log("Created menu: Spice Symphony Menu");

  // Create sections
  const starters = await prisma.menuSection.create({
    data: {
      id: "s1",
      menuId: menu.id,
      name: "Starters",
      displayOrder: 1,
    },
  });

  const mains = await prisma.menuSection.create({
    data: {
      id: "s2",
      menuId: menu.id,
      name: "Main Course",
      displayOrder: 2,
    },
  });

  const beverages = await prisma.menuSection.create({
    data: {
      id: "s3",
      menuId: menu.id,
      name: "Beverages",
      displayOrder: 3,
    },
  });
  console.log("Created sections: Starters, Main Course, Beverages");

  // Create items
  await prisma.menuItem.createMany({
    data: [
      {
        id: "i1",
        sectionId: starters.id,
        name: "Paneer Tikka",
        description: "Char-grilled cottage cheese cubes marinated in yogurt and spices",
        price: 249,
        currency: "INR",
        isVeg: true,
        isAvailable: true,
        displayOrder: 1,
      },
      {
        id: "i2",
        sectionId: starters.id,
        name: "Chicken Seekh Kebab",
        description: "Skewered minced chicken seasoned with herbs and grilled in tandoor",
        price: 299,
        currency: "INR",
        isVeg: false,
        isAvailable: true,
        displayOrder: 2,
      },
      {
        id: "i3",
        sectionId: mains.id,
        name: "Paneer Butter Masala",
        description: "Cottage cheese cubes cooked in a rich, creamy tomato gravy",
        price: 349,
        currency: "INR",
        isVeg: true,
        isAvailable: true,
        displayOrder: 1,
      },
      {
        id: "i4",
        sectionId: mains.id,
        name: "Butter Chicken",
        description: "Tandoori chicken pieces simmered in a velvety butter tomato sauce",
        price: 389,
        currency: "INR",
        isVeg: false,
        isAvailable: true,
        displayOrder: 2,
      },
      {
        id: "i5",
        sectionId: beverages.id,
        name: "Mango Lassi",
        description: "Traditional yogurt based drink blended with sweet mango pulp",
        price: 99,
        currency: "INR",
        isVeg: true,
        isAvailable: true,
        displayOrder: 1,
      },
      {
        id: "i6",
        sectionId: beverages.id,
        name: "Masala Chai",
        description: "Brewed black tea with a mixture of aromatic Indian spices and herbs",
        price: 49,
        currency: "INR",
        isVeg: true,
        isAvailable: true,
        displayOrder: 2,
      },
    ],
  });
  console.log("Seeded default menu items.");
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
