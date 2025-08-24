import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const replaceImport = mutation({
    args: {
        contacts: v.array(
            v.object({
                firstName: v.optional(v.string()),
                lastName: v.optional(v.string()),
                email: v.optional(v.string()),
                phoneNumber: v.optional(v.string()),
            })
        ),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Unauthorized");

        // Find or create company for user
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

        // Delete previous contacts
        const toDelete = ctx.db
            .query("contacts")
            .withIndex("by_company", (q) => q.eq("companyId", company._id));
        for await (const row of toDelete) {
            await ctx.db.delete(row._id);
        }

        // Insert new contacts
        for (const c of args.contacts) {
            await ctx.db.insert("contacts", {
                companyId: company._id,
                firstName: c.firstName,
                lastName: c.lastName,
                email: c.email,
                phoneNumber: c.phoneNumber,
                unsubscribed: false,
                createdAt: Date.now(),
            });
        }

        // Log GDPR import event
        await ctx.db.insert("gdprLogs", {
            companyId: company._id,
            action: "contact_import",
            userId,
            createdAt: Date.now(),
        });

        return null;
    },
});

export const list = query({
    args: {},
    returns: v.array(
        v.object({
            firstName: v.optional(v.string()),
            lastName: v.optional(v.string()),
            email: v.optional(v.string()),
            phoneNumber: v.optional(v.string()),
            unsubscribed: v.boolean(),
        })
    ),
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Unauthorized");

        const company = await ctx.db
            .query("companies")
            .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
            .unique();
        if (!company) return [];

        const results = await ctx.db
            .query("contacts")
            .withIndex("by_company", (q) => q.eq("companyId", company._id))
            .order("desc")
            .take(1000);
        return results.map((r) => ({
            firstName: r.firstName,
            lastName: r.lastName,
            email: r.email,
            phoneNumber: r.phoneNumber,
            unsubscribed: r.unsubscribed,
        }));
    },
});


