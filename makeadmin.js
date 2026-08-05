const prisma = require("./config/prismaClient");

async function main() {
  const updated = await prisma.user.update({
    where: { email: "yadavvaibhav965@gmail.com" }, // yahan apna exact registered email daal
    data: { role: "admin" },
  });
  console.log("Updated:", updated);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
