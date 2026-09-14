const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true
		},
		type: {
			type: String,
			enum: ["car", "bike"],
			required: true
		},
		brand: {
			type: String,
			trim: true
		},
		model: {
			type: String,
			trim: true
		},
		pricePerDay: {
			type: Number,
			required: true,
			min: 0
		},
		image: String,
		fuelType: String,
		transmission: String,
		seats: Number,
		location: String,
		available: {
			type: Boolean,
			default: true
		}
	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
