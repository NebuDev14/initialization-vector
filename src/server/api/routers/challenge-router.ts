import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  authProcedure
} from "~/server/api/trpc";

export const challengeRouter = createTRPCRouter({
  getAll: authProcedure.query(async ({ ctx }) => {
    return ctx.prisma.challenge.findMany();
  }),

  getChallengeBySubmission: authProcedure
    .input(z.object({ subId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.submitChallenge.findUnique({
        where: { id: input.subId },
        include: {
          Challenge: true
        }
      })
    }),

  acceptSubmission: authProcedure
    .input(z.object({ submissionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const submission = await ctx.prisma.submitChallenge.delete({ where: { id: input.submissionId } })

      return await ctx.prisma.userChallenge.update({
        where: {
          userId_challengeId: {
            userId: ctx.session.user.id,
            challengeId: submission?.challengeId as string
          }
        },
        data: {
          status: "COMPLETED",
        }
      });
    })

});
