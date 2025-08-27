"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import { randomBytes } from "node:crypto";
import { renderMessage, normalizePhoneToE164, requiresUcs2 } from "./utils";

function buildSmsText(baseMessage: string, token: string): string {
    return `${baseMessage}\n\nAvreg https://sendio.se/u/${token}`;
}

export const sendTest = action({
    args: {
        campaignId: v.id("campaigns"),
        message: v.string(),
        phoneNumber: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        senderId: v.optional(v.string()),
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

        // Enforce server-side suppression at send time for tests
        const blocked = await ctx.runQuery(api.sms.isSuppressedSms, {
            companyId: campaign.companyId,
            phoneNumber: args.phoneNumber,
        });
        if (blocked) {
            return { success: false, error: "Recipient is unsubscribed (SMS)" };
        }

        // Atomically claim the single free test send to avoid TOCTOU
        const claim = await ctx.runMutation(api.sms.claimTestSend, {
            campaignId: args.campaignId,
        });
        if (!claim.claimed) return { success: false, error: "Test already used or in progress" };

        const token = randomBytes(8).toString('base64url').slice(0, 10);
        const personalized = renderMessage(args.message, {
            first_name: args.firstName ?? "",
            last_name: args.lastName ?? "",
        });
        const text = buildSmsText(personalized, token);
        const ucs2 = requiresUcs2(text);
        console.log("[sendTest] composed text:", text);
        console.log("[sendTest] requiresUcs2:", ucs2);

        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const Twilio = require("twilio");
            const sid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const configuredNumber = process.env.TWILIO_PHONE_NUMBER;
            const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
            if (!sid || !authToken || !configuredNumber) throw new Error("Twilio is not configured");
            const client = new Twilio(sid, authToken);
            // Use numeric sender when UCS-2 (emojis) are present for best deliverability
            const alphanumeric = (args.senderId ?? "").trim();
            const from = ucs2 ? configuredNumber : (alphanumeric.length > 0 ? alphanumeric : configuredNumber);
            const to = normalizePhoneToE164(args.phoneNumber);
            if (!to) throw new Error("Invalid phone number format");
            console.log("[sendTest] sending SMS", { from, to, bodyLength: text.length, ucs2, usingMS: Boolean(messagingServiceSid) });
            if (messagingServiceSid) {
                await client.messages.create({ messagingServiceSid, to, body: text });
            } else {
                await client.messages.create({ from, to, body: text });
            }

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


