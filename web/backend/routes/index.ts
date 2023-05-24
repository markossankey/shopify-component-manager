import express from "express";
import componentRoutes from "./component.js";
import locationRoutes from "./location.js";
import productRoutes from "./product.js";

const router = express.Router();

router.use("/location", locationRoutes);
router.use("/product", productRoutes);
router.use("/component", componentRoutes);

export default router;
