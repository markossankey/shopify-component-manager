import { Session } from "@shopify/shopify-api";
import express from "express";
import { prisma } from "../lib/prisma.js";
import { INVENTORY_IDS, MOCK_SESSION } from "../mockData/index.js";
import { getProductsInLocationForComponent } from "../queries/prisma/products.js";
import { writeShopifyLocationsToPrisma, writeShopifyProductsToPrisma } from "../queries/prisma/writeShopifyToPrisma.js";
import { getInventoryLevelsFromShopify, getLocationsFromShopify, getProductsFromShopify } from "../queries/shopify/index.js";

const routes = express.Router();

routes.get("/", async (req, res) => {
  const { variants, component, location } = await getProductsInLocationForComponent(
    "81185866015",
    "clhmlpptt0005vh4594qdrpys"
  );
  const componentsPerIncrement = variants.reduce((acc: number, { componentsInEach }) => acc + componentsInEach, 0);
  const dividedEvenly = Math.floor(component.inStock / componentsPerIncrement);
  let leftOver = component.inStock % componentsPerIncrement;

  variants.forEach((variant) => (variant.inStock = variant.inStock + dividedEvenly));
  variants.sort((a, b) => b.componentsInEach - a.componentsInEach);

  const smallestConsumableAmount = variants[variants.length - 1].componentsInEach;

  while (leftOver >= smallestConsumableAmount) {
    variants.forEach((variant) => {
      if (leftOver >= variant.componentsInEach) {
        variant.inStock++;
        leftOver -= variant.componentsInEach;
      }
    });
  }

  const updates = await prisma.$transaction([
    ...variants.map((variant) =>
      prisma.variantsInLocations.update({
        where: { id: variant.variantInLocationId },
        data: { inStock: variant.inStock },
      })
    ),
  ]);

  res.send({ updates, variants, dividedEvenly, componentsPerIncrement, inStock: component.inStock, leftOver });
});

routes.get("/locations", async (req, res) => {
  const locations = await getLocationsFromShopify({ session: MOCK_SESSION });
  const createdLocations = await writeShopifyLocationsToPrisma({ session: MOCK_SESSION, locations });
  res.status(200).send({ createdLocations, locations });
});

routes.get("/products", async (req, res, next) => {
  try {
    const products = await getProductsFromShopify({ session: MOCK_SESSION });
    const createdProducts = await writeShopifyProductsToPrisma({ session: MOCK_SESSION, products });

    const inventoryIds = products.flatMap((product) =>
      product.variants?.reduce((acc: any, variant: any) => {
        acc.push(variant.inventory_item_id);
        return acc;
      }, [])
    );

    res.status(200).send({ createdProducts, inventoryIds, products });
  } catch (e) {
    next(e);
  }
});

// TODO update scope so this can be tested
routes.get("/inventory-levels", async (req, res) => {
  const inventoryLevels = await getInventoryLevelsFromShopify({ session: MOCK_SESSION, inventoryIds: INVENTORY_IDS });
  res.status(200).send(inventoryLevels);
});
//

routes.get("/load-session", async (req, res, next) => {
  try {
    // const session = PrismaSessionStorage.loadSession(MOCK_SESSION.id);
    // res.send(session);
    res.send({});
  } catch (e) {
    next(e);
  }
});

routes.get("/sync-shop", async (req, res, next) => {
  const session = new Session(MOCK_SESSION);
  try {
    // const data = await PrismaSessionStorage.syncNewShop(session);
    // res.send(data);
  } catch (e) {
    next(e);
  }
});

export default routes;
