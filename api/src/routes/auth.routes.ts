import { Router } from "express";

const router = Router();

router.post("/register", (req, res) => {

  console.log("Register data:", req.body);

  res.status(201).json({
    success: true,
    message: "Registration successful"
  });

});


router.post("/login", (req, res) => {

  res.json({
    success: true,
    message: "Login successful",
    token: "test-token",
    user: {
      role: "SUPER_ADMIN",
      firstName: "Maruti",
      lastName: "Chavan",
      email: "maruti.chavan1155@gmail.com"
    }
  });

});


export default router;