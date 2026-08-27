const User = require("../src/models/User");

/**
 * createFirstAdmin
 * ----------------
 * Automatically seeds a Super Admin user on server startup
 * if no admin account exists in the database.
 *
 * Credentials (override via .env):
 *   ADMIN_NAME     → default: "Admin User"
 *   ADMIN_EMAIL    → default: "admin@example.com"
 *   ADMIN_PASSWORD → default: "Admin@123"
 */
const createFirstAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";

    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      const admin = new User({
        name: process.env.ADMIN_NAME || "Admin User",
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || "Admin@123",
        role: "Admin",
        adminRole: "superAdmin",
        status: "Active",
      });

      await admin.save();
      console.log("==> Initial Super Admin created successfully!");
      console.log(`    Email: ${adminEmail}`);
    } else if (adminExists.role === "Admin" && adminExists.adminRole !== "superAdmin") {
      adminExists.adminRole = "superAdmin";
      await adminExists.save();
    }
  } catch (error) {
    console.error("Error seeding admin:", error.message);
  }
};

module.exports = { createFirstAdmin };
