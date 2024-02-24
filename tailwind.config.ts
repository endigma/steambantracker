import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
} satisfies Config;
