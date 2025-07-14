import * as admin from "firebase-admin";

// Prevent double-init when emulator & tests reload
if (!admin.apps.length) {
  admin.initializeApp();
}

export {admin};
