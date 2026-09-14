const express = require("express");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const { requireAdmin, requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get("/summary", async (req, res) => {
  try {
    const [vehicles, availableVehicles, bookings, revenue] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ available: true }),
      Booking.countDocuments(),
      Booking.aggregate([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }])
    ]);

    res.json({ vehicles, availableVehicles, bookings, revenue: revenue[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/bookings", async (req, res) => {
  try {
    res.json(await Booking.find().populate("vehicle").sort({ createdAt: -1 }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/bookings/:id/status", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate("vehicle");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/vehicles", async (req, res) => {
  try {
    res.status(201).json(await Vehicle.create(req.body));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch("/vehicles/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/vehicles/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ message: "Vehicle deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
