import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { checkout, polar, portal } from "@polar-sh/better-auth";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "@/generated/prisma/client";
import prisma from "./db";
import { polarClient } from "./polar";
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    polar({
        client: polarClient,
        createCustomerOnSignUp: true,
        use: [
            checkout({
                products: [
                    {
                        productId: "5445093a-94ca-486b-8f48-9326986d8165",
                        slug: "Nodeflo-pro" // Custom slug for easy reference in Checkout URL, e.g. /checkout/Nodeflo-pro
                    }
                ],
                successUrl: process.env.POLAR_SUCCESS_URL,
                authenticatedUsersOnly: true
            }),
            portal(),
        ],
    })
]
});
