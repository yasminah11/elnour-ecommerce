import checkConnectionDB from "../DB/connectionDB.js";
import staffModel from "../DB/models/staff.model.js";
import { bcryptPssword } from "../common/utils/security/hash.security.js";
import { staffRoleEnum } from "../common/enum/auth.enum.js";
import mongoose from "mongoose";

// One-time bootstrap script.
//
// FR-ADMIN-01: "Owner shall have full access", and the staff-creation
// endpoint (POST /auth/admin/staff) requires an authenticated Owner to run.
// The SRS does not describe how the very first Owner account is created,
// so this script exists only to break that chicken-and-egg problem —
// it is NOT an HTTP endpoint and is not reachable by any client.
//
// Usage:
//   OWNER_FIRSTNAME=Ahmed OWNER_LASTNAME=Nour OWNER_EMAIL=owner@elnour.com \
//   OWNER_PASSWORD=abcde1234567 node src/seed/seed.owner.js
//
// It refuses to run if an Owner already exists, so it can only ever create
// the first one.

const run = async () => {
    const { OWNER_FIRSTNAME, OWNER_LASTNAME, OWNER_EMAIL, OWNER_PASSWORD } = process.env;

    if (!OWNER_FIRSTNAME || !OWNER_LASTNAME || !OWNER_EMAIL || !OWNER_PASSWORD) {
        console.error(
            "Missing env vars. Provide OWNER_FIRSTNAME, OWNER_LASTNAME, OWNER_EMAIL, OWNER_PASSWORD."
        );
        process.exit(1);
    }

    await checkConnectionDB();

    const existingOwner = await staffModel.findOne({ role: staffRoleEnum.owner });
    if (existingOwner) {
        console.error(`An Owner account already exists (${existingOwner.email}). Aborting.`);
        await mongoose.disconnect();
        process.exit(1);
    }

    const owner = await staffModel.create({
        firstName: OWNER_FIRSTNAME,
        lastName: OWNER_LASTNAME,
        email: OWNER_EMAIL,
        password: bcryptPssword({ textPlan: OWNER_PASSWORD }),
        role: staffRoleEnum.owner
    });

    console.log(`Owner account created: ${owner.email}`);
    await mongoose.disconnect();
    process.exit(0);
};

run().catch(async (err) => {
    console.error(err);
    await mongoose.disconnect();
    process.exit(1);
});
