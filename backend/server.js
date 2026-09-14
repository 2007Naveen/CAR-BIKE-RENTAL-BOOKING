const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");
require("dotenv").config();
const Vehicle = require("./models/Vehicle");
const vehicleRoutes = require("./routes/vehicleRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Use a resolver that supports MongoDB Atlas SRV records on networks whose DNS blocks SRV lookups.
dns.setServers(["1.1.1.1", "8.8.8.8"]);

app.use(cors());
app.use(express.json());
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.json({
    message: "Car & Bike Rental API Running"
  });
});

app.get("/api/seed", async (req, res) => {
  try {
    await Vehicle.deleteMany({});

    const vehicles = await Vehicle.insertMany([
      {
        name: "Royal Enfield Classic 350",
        type: "bike",
        brand: "Royal Enfield",
        model: "Classic 350",
        pricePerDay: 899,
        image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39",
        fuelType: "Petrol",
        transmission: "Manual",
        seats: 2,
        location: "Coimbatore",
        available: true
      },
      {
        name: "Yamaha MT-15",
        type: "bike",
        brand: "Yamaha",
        model: "MT-15",
        pricePerDay: 799,
        image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc",
        fuelType: "Petrol",
        transmission: "Manual",
        seats: 2,
        location: "Erode",
        available: true
      },
      {
        name: "Hyundai Creta",
        type: "car",
        brand: "Hyundai",
        model: "Creta",
        pricePerDay: 2499,
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6",
        fuelType: "Petrol",
        transmission: "Automatic",
        seats: 5,
        location: "Coimbatore",
        available: true
      },
      {
        name: "Mahindra Thar",
        type: "car",
        brand: "Mahindra",
        model: "Thar",
        pricePerDay: 2999,
        image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b",
        fuelType: "Diesel",
        transmission: "Manual",
        seats: 4,
        location: "Salem",
        available: true
      }
    ]);

    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});