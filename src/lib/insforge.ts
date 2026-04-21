import { createClient } from "@insforge/sdk";

// Hardcoded specifically for production build reliability
const INSFORGE_URL = "https://fw9u7qf8.us-east.insforge.app";
const INSFORGE_ANON_KEY = "ik_3ab26765315e8a7f1b6288174f74c175";

export const insforge = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: INSFORGE_ANON_KEY,
});
