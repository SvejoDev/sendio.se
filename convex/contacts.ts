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

        // Load existing contacts into memory, keyed by email
        const existingContacts = await ctx.db
            .query("contacts")
            .withIndex("by_company", (q) => q.eq("companyId", company._id))
            .collect();

        const existingContactsMap = new Map<string, any>();
        for (const contact of existingContacts) {
            if (contact.email) {
                existingContactsMap.set(contact.email.toLowerCase(), contact);
            }
        }

        // Create a set of incoming contact emails for efficient lookup
        const incomingEmails = new Set<string>();
        for (const contact of args.contacts) {
            if (contact.email) {
                incomingEmails.add(contact.email.toLowerCase());
            }
        }

        // Delete contacts that are no longer in the incoming list
        for (const contact of existingContacts) {
            if (contact.email && !incomingEmails.has(contact.email.toLowerCase())) {
                await ctx.db.delete(contact._id);
            }
        }

        // Insert or update contacts from the incoming list
        for (const c of args.contacts) {
            if (!c.email) continue; // Skip contacts without email

            const emailKey = c.email.toLowerCase();
            const existingContact = existingContactsMap.get(emailKey);

            if (existingContact) {
                // Update existing contact, preserving unsubscribe status and createdAt
                await ctx.db.patch(existingContact._id, {
                    firstName: c.firstName,
                    lastName: c.lastName,
                    phoneNumber: c.phoneNumber,
                    // Preserve existing unsubscribed status and createdAt
                });
            } else {
                // Insert new contact
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


