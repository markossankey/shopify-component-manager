import express from "express";
import { prisma } from "../lib/prisma.js";
import { createComponent, getComponent, getComponents, upsertComponentLocation } from "../queries/prisma/components.js";
import { updateInventoryLevelInShopify } from "../queries/shopify/index.js";
import { redistributeComponentInLocation } from "../utils/redistributeComponents.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const [component, locations] = await Promise.all([
    createComponent({ name: req.body.name, shop: res.locals.shopify.session.shop }),
    prisma.location.findMany({ where: { shopId: res.locals.shopify.session.shop } }),
  ]);

  // add components to all locations -- can be optimized later
  await prisma.componentsInLocations.createMany({
    data: locations.map((location) => ({
      componentId: component.id,
      externalLocationId: location.externalId,
      shopId: res.locals.shopify.session.shop,
      inStock: 0,
    })),
    skipDuplicates: true,
  });

  res.send(component);
});

router.get("/", async (req, res) => {
  const components = await getComponents(res.locals.shopify.session.shop);
  res.send(components);
});

router.get("/:id", async (req, res) => {
  const component = await getComponent(req.params.id);
  res.send(component);
});

router.get("/:id/location", async (req, res) => {
  const locations = await prisma.componentsInLocations.findMany({
    where: { componentId: req.params.id },
    include: { location: true },
    orderBy: { location: { name: "asc" } },
  });
  res.send(locations);
});

router.patch("/:id/location/:locationId", async (req, res, next) => {
  const { id, locationId } = req.params;
  const { inStock } = req.body;

  if (typeof inStock !== "number") {
    next(new Error("Invalid request body"));
  }

  const locations = await upsertComponentLocation({
    componentId: id,
    locationId,
    inStock,
    shop: res.locals.shopify.session.shop,
  });

  res.send(locations);
});

router.get("/:id/product", async (req, res) => {
  const componentProducts = await prisma.componentsInVariants.findMany({
    where: { componentId: req.params.id },
    include: { variant: { include: { locations: { select: { inStock: true } }, product: { select: { name: true } } } } },
  });
  res.send(componentProducts);
});

router.post("/:id/product/:variantId", async (req, res, next) => {
  const { id, variantId } = req.params;
  const { quantity } = req.body;

  if (typeof quantity !== "number") {
    next(new Error("Invalid request body"));
  }

  const componentProduct = await prisma.componentsInVariants.create({
    data: {
      component: { connect: { id } },
      variant: { connect: { id: variantId } },
      shop: { connect: { shop: res.locals.shopify.session.shop } },
      componentsPerVariant: quantity,
    },
  });

  res.send(componentProduct);
});

router.patch("/:id/locations/:locationId/product", async (req, res, next) => {
  const { id, locationId } = req.params;
  if (req.query.redistribute) {
    const updatedVariants = await redistributeComponentInLocation(locationId, id);

    // updates inventory in shopify
    await Promise.all(
      updatedVariants.map((variant) =>
        updateInventoryLevelInShopify({
          locationId: variant.externalLocationId,
          available: variant.inStock,
          inventoryItemId: variant.variant.externalInventoryId,
          session: res.locals.shopify.session,
        })
      )
    );
    res.send({ updatedVariants, updatedInShopify: true });
  } else {
    res.status(400).send("Invalid query parameter");
  }
});

router.delete("/:id/product/:variantId", async (req, res) => {
  const { id, variantId } = req.params;
  await prisma.componentsInVariants.delete({
    where: {
      componentId_externalVariantId_shopId: {
        componentId: id,
        externalVariantId: variantId,
        shopId: res.locals.shopify.session.shop,
      },
    },
  });
  res.send("OK");
});
export default router;
