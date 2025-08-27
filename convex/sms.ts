import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id, Doc } from "./_generated/dataModel";

// Get campaign by ID
export const getCampaign = query({
    args: { campaignId: v.id("campaigns") },
    returns: v.union(
        v.object({
            _id: v.id("campaigns"),
            companyId: v.id("companies"),
            name: v.string(),
            type: v.union(v.literal("sms"), v.literal("email"), v.literal("both")),
            status: v.union(v.literal("draft"), v.literal("paid"), v.literal("sent")),
            content: v.object({}),
            recipientCount: v.number(),
            totalCost: v.number(),
            createdAt: v.number(),
            testInProgress: v.optional(v.boolean()),
            testConsumed: v.optional(v.boolean()),
        }),
        v.null()
    ),
    handler: async (ctx, args) => {
        return await ctx.db.get(args.campaignId);
    },
});

// Get company by ID
export const getCompany = query({
    args: { companyId: v.id("companies") },
    returns: v.union(
        v.object({
            _id: v.id("companies"),
            userId: v.id("users"),
            companyName: v.string(),
            companyLogo: v.optional(v.string()),
            createdAt: v.number(),
        }),
        v.null()
    ),
    handler: async (ctx, args) => {
        return await ctx.db.get(args.companyId);
    },
});

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
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Unauthorized");

        const campaign = await ctx.db.get(args.campaignId);
        if (!campaign) throw new Error("Campaign not found");

        const company = await ctx.db.get(campaign.companyId);
        if (!company) throw new Error("Company not found");

        if (company.userId !== userId) throw new Error("Unauthorized");

        const analyticsData: Omit<Doc<"campaignAnalytics">, "_id" | "_creationTime"> = {
            campaignId: args.campaignId,
            // Not tied to a contact in free test send
            contactId: undefined,
            type: "sms",
            status: args.status,
            sentAt: Date.now(),
            errorMessage: args.errorMessage,
            isTest: true,
        };
        await ctx.db.insert("campaignAnalytics", analyticsData);
        return null;
    },
});

// Atomically claim the one free test send for a campaign
export const claimTestSend = mutation({
    args: { campaignId: v.id("campaigns") },
    returns: v.object({ claimed: v.boolean() }),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Unauthorized");

        const campaign = await ctx.db.get(args.campaignId);
        if (!campaign) throw new Error("Campaign not found");

        const company = await ctx.db.get(campaign.companyId);
        if (!company) throw new Error("Company not found");
        if (company.userId !== userId) throw new Error("Unauthorized");

        // If already consumed or in progress, cannot claim
        if (campaign.testConsumed === true) return { claimed: false };
        if (campaign.testInProgress === true) return { claimed: false };

        // Mark in progress
        await ctx.db.patch(args.campaignId, { testInProgress: true });
        return { claimed: true };
    },
});

// Finalize a claimed test send (success path)
export const finalizeTestSend = mutation({
    args: {
        campaignId: v.id("campaigns"),
        phoneNumber: v.string(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Unauthorized");

        const campaign = await ctx.db.get(args.campaignId);
        if (!campaign) throw new Error("Campaign not found");

        const company = await ctx.db.get(campaign.companyId);
        if (!company) throw new Error("Company not found");
        if (company.userId !== userId) throw new Error("Unauthorized");

        // Write analytics and mark consumed
        const analyticsData: Omit<Doc<"campaignAnalytics">, "_id" | "_creationTime"> = {
            campaignId: args.campaignId,
            contactId: undefined,
            type: "sms",
            status: "sent",
            sentAt: Date.now(),
            errorMessage: undefined,
            isTest: true,
        };
        await ctx.db.insert("campaignAnalytics", analyticsData);
        await ctx.db.patch(args.campaignId, { testInProgress: false, testConsumed: true });
        return null;
    },
});

// Roll back a claimed test send (failure path) and optionally record failure analytics
export const failTestSend = mutation({
    args: {
        campaignId: v.id("campaigns"),
        phoneNumber: v.string(),
        errorMessage: v.string(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Unauthorized");

        const campaign = await ctx.db.get(args.campaignId);
        if (!campaign) throw new Error("Campaign not found");

        const company = await ctx.db.get(campaign.companyId);
        if (!company) throw new Error("Company not found");
        if (company.userId !== userId) throw new Error("Unauthorized");

        const analyticsData: Omit<Doc<"campaignAnalytics">, "_id" | "_creationTime"> = {
            campaignId: args.campaignId,
            contactId: undefined,
            type: "sms",
            status: "failed",
            sentAt: Date.now(),
            errorMessage: args.errorMessage,
            isTest: true,
        };
        await ctx.db.insert("campaignAnalytics", analyticsData);
        // Release claim so another attempt can be made
        await ctx.db.patch(args.campaignId, { testInProgress: false });
        return null;
    },
});
// Needed for type-safe api references
import { api } from "./_generated/api";

// Server-side check: is a phone number suppressed/unsubscribed for this company?
export const isSuppressedSms = query({
    args: { companyId: v.id("companies"), phoneNumber: v.string() },
    returns: v.boolean(),
    handler: async (ctx, args) => {
        // Check permanent suppression table first (authoritative)
        const sup = await ctx.db
            .query("suppressions")
            .withIndex("by_company_and_phone", (q) =>
                q.eq("companyId", args.companyId).eq("phoneNumber", args.phoneNumber),
            )
            .unique();
        if (sup && sup.smsOptOut === true) return true;

        // Fallback: check contacts with this phone for unsubscribedSms within the company
        const byPhone = await ctx.db
            .query("contacts")
            .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
            .collect();
        for (const c of byPhone) {
            if (c.companyId === args.companyId && (c.unsubscribedSms === true || c.unsubscribed === true)) {
                return true;
            }
        }
        return false;
    },
});

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
            .filter((q) => q.eq(q.field("type"), args.type))
            .order("desc")
            .first();
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


