import nextConfig from "eslint-config-next";

// eslint-config-next v16 exports an array-like of flat config objects.
// Entry 0: "next" (core + core-web-vitals), Entry 1: "next/typescript"
const nextFlat = Array.from(nextConfig).filter(Boolean);

const config = [
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/drizzle/**",
      "next-env.d.ts",
    ],
  },
  ...nextFlat,
];

export default config;