"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

function buildSmsText(baseMessage: string, token: string): string {
    return `${baseMessage}\n\nAvreg https://sendio.se/u/${token}`;
}

export const sendTest = action({
    args: {
        campaignId: v.id("campaigns"),
        message: v.string(),
        phoneNumber: v.string(),
    },
    returns: v.object({ success: v.boolean(), error: v.optional(v.string()) }),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) return { success: false, error: "Unauthorized" };

        const alreadyUsed = await ctx.runQuery(api.sms.hasUsedTest, {
            campaignId: args.campaignId,
        });
        if (alreadyUsed) return { success: false, error: "Test already used" };

        const token = Math.random().toString(36).slice(2, 12);
        const text = buildSmsText(args.message, token);

        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const Twilio = require("twilio");
            const sid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const from = process.env.TWILIO_PHONE_NUMBER;
            if (!sid || !authToken || !from) throw new Error("Twilio is not configured");
            const client = new Twilio(sid, authToken);
            await client.messages.create({ from, to: args.phoneNumber, body: text });

            await ctx.runMutation(api.sms.markTestUsed, {
                campaignId: args.campaignId,
                phoneNumber: args.phoneNumber,
                status: "sent",
            });
            return { success: true };
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            await ctx.runMutation(api.sms.markTestUsed, {
                campaignId: args.campaignId,
                phoneNumber: args.phoneNumber,
                status: "failed",
                errorMessage: msg,
            });
            return { success: false, error: msg };
        }
    },
});


