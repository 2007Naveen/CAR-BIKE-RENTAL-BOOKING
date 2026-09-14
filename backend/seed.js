const dns = require("dns");
const mongoose = require("mongoose");
require("dotenv").config();
const Vehicle = require("./models/Vehicle");

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const vehicles = [
  {
    name: "Royal Enfield Classic 350",
    type: "bike",
    brand: "Royal Enfield",
    model: "Classic 350",
    pricePerDay: 899,
    fuelType: "Petrol",
    transmission: "Manual",
    seats: 2,
    location: "Coimbatore",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39",
    available: true
  },
  {
    name: "Yamaha MT-15",
    type: "bike",
    brand: "Yamaha",
    model: "MT-15",
    pricePerDay: 799,
    fuelType: "Petrol",
    transmission: "Manual",
    seats: 2,
    location: "Coimbatore",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc",
    available: true
  },
  {
    name: "Hyundai Creta",
    type: "car",
    brand: "Hyundai",
    model: "Creta",
    pricePerDay: 2499,
    fuelType: "Petrol",
    transmission: "Automatic",
    seats: 5,
    location: "Coimbatore",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6",
    available: true
  },
  {
    name: "Mahindra Thar",
    type: "car",
    brand: "Mahindra",
    model: "Thar",
    pricePerDay: 2999,
    fuelType: "Diesel",
    transmission: "Manual",
    seats: 5,
    location: "Coimbatore",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b",
    available: true
  }
];

async function seedVehicles() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected");

  for (const vehicle of vehicles) {
    await Vehicle.updateOne({ name: vehicle.name }, { $set: vehicle }, { upsert: true });
  }

  console.log("Vehicles Added Successfully");
  await mongoose.disconnect();
}

seedVehicles().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
