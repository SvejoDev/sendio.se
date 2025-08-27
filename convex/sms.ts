import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

// Track that a campaign has consumed its one free test send
export const hasUsedTest = query({
    args: { campaignId: v.id("campaigns") },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        const record = await ctx.db
            .query("campaignAnalytics")
            .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
            .order("desc")
            .collect();
        return record.some((r) => r.isTest === true && r.type === "sms");
    },
});

export const markTestUsed = mutation({
    args: {
        campaignId: v.id("campaigns"),
        phoneNumber: v.string(),
        status: v.union(v.literal("sent"), v.literal("failed")),
        errorMessage: v.optional(v.string()),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        await ctx.db.insert("campaignAnalytics", {
            campaignId: args.campaignId,
            // Not tied to a contact in free test send
            type: "sms",
            status: args.status,
            sentAt: Date.now(),
            errorMessage: args.errorMessage,
            isTest: true,
        } as any);
        return null;
    },
});
// Needed for type-safe api references
import { api } from "./_generated/api";

export const ensureDraftCampaign = mutation({
    args: { type: v.union(v.literal("sms"), v.literal("email")) },
    returns: v.id("campaigns"),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Unauthorized");

        // Find or create company
        let company = await ctx.db
            .query("companies")
            .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
            .unique();
        if (!company) {
            const id = await ctx.db.insert("companies", {
                userId: userId as Id<"users">,
                companyName: "Företag",
                createdAt: Date.now(),
            });
            company = await ctx.db.get(id);
        }
        if (!company) throw new Error("Company not found");

        // Reuse existing draft if present
        const existingDraft = await ctx.db
            .query("campaigns")
            .withIndex("by_company_and_status", (q) =>
                q.eq("companyId", company._id).eq("status", "draft")
            )
            .order("desc")
            .unique();
        if (existingDraft) return existingDraft._id;

        const newId = await ctx.db.insert("campaigns", {
            companyId: company._id,
            name: "Utkast",
            type: args.type,
            status: "draft",
            content: {},
            recipientCount: 0,
            totalCost: 0,
            createdAt: Date.now(),
        });
        return newId;
    },
});


