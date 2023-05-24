import express from "express";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const products = await prisma.product.findMany({
    where: {
      shopId: res.locals.shopify.session.shop,
    },
    include: {
      variants: true,
    },
  });

  res.send(products);
});

export default router;
