import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

function generateShortToken(): string {
    // 10-char base36 token, retry on collision
    return Math.random().toString(36).slice(2, 12);
}

export const generateToken = mutation({
    args: {
        campaignId: v.id("campaigns"),
        contactId: v.id("contacts"),
        type: v.union(v.literal("sms"), v.literal("email")),
    },
    returns: v.object({ token: v.string() }),
    handler: async (ctx, args) => {
        let token = generateShortToken();
        // Ensure uniqueness
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const existing = await ctx.db
                .query("unsubscribeTokens")
                .withIndex("by_token", (q) => q.eq("token", token))
                .unique();
            if (!existing) break;
            token = generateShortToken();
        }

        await ctx.db.insert("unsubscribeTokens", {
            campaignId: args.campaignId,
            contactId: args.contactId,
            token,
            type: args.type,
            used: false,
            createdAt: Date.now(),
        });
        return { token };
    },
});

export const resolveToken = query({
    args: { token: v.string() },
    returns: v.union(
        v.object({
            valid: v.literal(true),
            contactId: v.id("contacts"),
            campaignId: v.id("campaigns"),
            type: v.union(v.literal("sms"), v.literal("email")),
            used: v.boolean(),
            contact: v.object({
                firstName: v.optional(v.string()),
                lastName: v.optional(v.string()),
                email: v.optional(v.string()),
                phoneNumber: v.optional(v.string()),
                unsubscribedSms: v.optional(v.boolean()),
                unsubscribedEmail: v.optional(v.boolean()),
            }),
        }),
        v.object({ valid: v.literal(false) })
    ),
    handler: async (ctx, args) => {
        const record = await ctx.db
            .query("unsubscribeTokens")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .unique();
        if (!record) return { valid: false as const };
        const contact = await ctx.db.get(record.contactId);
        if (!contact) return { valid: false as const };
        return {
            valid: true as const,
            contactId: record.contactId,
            campaignId: record.campaignId,
            type: record.type,
            used: record.used,
            contact: {
                firstName: contact.firstName,
                lastName: contact.lastName,
                email: contact.email,
                phoneNumber: contact.phoneNumber,
                unsubscribedSms: contact.unsubscribedSms,
                unsubscribedEmail: contact.unsubscribedEmail,
            },
        };
    },
});

export const applyUnsubscribeWithToken = mutation({
    args: {
        token: v.string(),
        sms: v.boolean(),
        email: v.boolean(),
        ipAddress: v.optional(v.string()),
        userAgent: v.optional(v.string()),
    },
    returns: v.object({ success: v.boolean() }),
    handler: async (ctx, args) => {
        const record = await ctx.db
            .query("unsubscribeTokens")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .unique();
        if (!record) return { success: false };
        const contact = await ctx.db.get(record.contactId);
        if (!contact) return { success: false };

        const nextUnsubSms = args.sms ? true : contact.unsubscribedSms ?? false;
        const nextUnsubEmail = args.email ? true : contact.unsubscribedEmail ?? false;
        await ctx.db.patch(contact._id, {
            unsubscribedSms: nextUnsubSms,
            unsubscribedEmail: nextUnsubEmail,
            unsubscribed: nextUnsubSms || nextUnsubEmail,
        });

        // Log GDPR action(s)
        const companyId = contact.companyId as Id<"companies">;
        const now = Date.now();
        if (args.sms) {
            await ctx.db.insert("gdprLogs", {
                companyId,
                action: "unsubscribe",
                contactId: contact._id,
                campaignId: record.campaignId,
                details: "SMS unsubscribe via token",
                ipAddress: args.ipAddress,
                userAgent: args.userAgent,
                createdAt: now,
            });
        }
        if (args.email) {
            await ctx.db.insert("gdprLogs", {
                companyId,
                action: "unsubscribe",
                contactId: contact._id,
                campaignId: record.campaignId,
                details: "Email unsubscribe via token",
                ipAddress: args.ipAddress,
                userAgent: args.userAgent,
                createdAt: now,
            });
        }

        // Mark token used
        if (!record.used) {
            await ctx.db.patch(record._id, { used: true, usedAt: now });
        }

        return { success: true };
    },
});


