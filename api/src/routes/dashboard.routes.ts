import { Router } from "express";

const router = Router();


router.get("/stats", async (req, res) => {

  res.json({
    success: true,

    data: {
      customers: 125,
      appointments: 32,
      services: 15,
      revenue: 45000
    }
  });

});


export default router;