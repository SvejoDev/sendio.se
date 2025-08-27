"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import { randomBytes } from "node:crypto";

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

        // Fetch campaign and verify authorization
        const campaign = await ctx.runQuery(api.sms.getCampaign, {
            campaignId: args.campaignId,
        });
        if (!campaign) return { success: false, error: "Campaign not found" };

        // Check if user owns the company that owns the campaign
        const company = await ctx.runQuery(api.sms.getCompany, {
            companyId: campaign.companyId,
        });
        if (!company || company.userId !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        // Atomically claim the single free test send to avoid TOCTOU
        const claim = await ctx.runMutation(api.sms.claimTestSend, {
            campaignId: args.campaignId,
        });
        if (!claim.claimed) return { success: false, error: "Test already used or in progress" };

        const token = randomBytes(8).toString('base64url').slice(0, 10);
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

            await ctx.runMutation(api.sms.finalizeTestSend, {
                campaignId: args.campaignId,
                phoneNumber: args.phoneNumber,
            });
            return { success: true };
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            await ctx.runMutation(api.sms.failTestSend, {
                campaignId: args.campaignId,
                phoneNumber: args.phoneNumber,
                errorMessage: msg,
            });
            return { success: false, error: msg };
        }
    },
});


