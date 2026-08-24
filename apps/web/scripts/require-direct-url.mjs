if (!process.env.DIRECT_URL) {
  console.error("DIRECT_URL is required for controlled Prisma migrations and seed operations.");
  process.exit(1);
}
