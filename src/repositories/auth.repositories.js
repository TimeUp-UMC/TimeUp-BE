import { prisma } from '../db.config.js';

export const findUserByEmail = async (email) => {
  return await prisma.users.findUnique({ where: { email } });
};

export const createUser = async ({ email, name }) => {
  const now = new Date();
  return await prisma.users.create({
    data: {
      email,
      name,
      created_at: now,
      updated_at: now,
      isNew: true,
    },
  });
};
