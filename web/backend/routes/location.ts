import express from "express";
import { prisma } from "../lib/prisma.js";
import { getProductsInLocation } from "../queries/prisma/locations.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const locations = await prisma.location.findMany({
    where: {
      shopId: res.locals.shopify.session.shop,
    },
  });

  res.send(locations);
});

router.get("/:id/component/:componentId/product", async (req, res) => {
  const { id: locationId, componentId } = req.params;
  const location = await getProductsInLocation({ componentId, locationId });

  res.send(location);
});

export default router;
