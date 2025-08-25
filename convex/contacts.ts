import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

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


// Paginated listing with server-side search filtering
export const listPaginated = query({
    args: {
        paginationOpts: paginationOptsValidator,
        unsubscribed: v.optional(v.union(v.literal("all"), v.literal("only"), v.literal("active"))),
        search: v.optional(v.string()),
    },
    returns: v.object({
        page: v.array(
            v.object({
                _id: v.id("contacts"),
                _creationTime: v.number(),
                firstName: v.optional(v.string()),
                lastName: v.optional(v.string()),
                email: v.optional(v.string()),
                phoneNumber: v.optional(v.string()),
                unsubscribed: v.boolean(),
            }),
        ),
        isDone: v.boolean(),
        continueCursor: v.union(v.string(), v.null()),
    }),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Unauthorized");

        const company = await ctx.db
            .query("companies")
            .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
            .unique();
        if (!company) {
            return { page: [], isDone: true, continueCursor: null };
        }

        const unsubscribedFilter = args.unsubscribed ?? "all";
        const searchTerm = args.search?.trim().toLowerCase();

        // If search is provided, we need to fetch all contacts and filter server-side
        // since we don't have a text search index
        if (searchTerm && searchTerm.length > 0) {
            let allContacts;

            if (unsubscribedFilter === "only" || unsubscribedFilter === "active") {
                const flag = unsubscribedFilter === "only";
                allContacts = await ctx.db
                    .query("contacts")
                    .withIndex("by_company_and_unsubscribed", (q) =>
                        q.eq("companyId", company._id).eq("unsubscribed", flag),
                    )
                    .order("desc")
                    .collect();
            } else {
                allContacts = await ctx.db
                    .query("contacts")
                    .withIndex("by_company", (q) => q.eq("companyId", company._id))
                    .order("desc")
                    .collect();
            }

            // Apply search filter
            const filteredContacts = allContacts.filter((c) => {
                const name = `${c.firstName ?? ""} ${c.lastName ?? ""}`.toLowerCase();
                return (
                    (c.email?.toLowerCase().includes(searchTerm) ?? false) ||
                    (c.phoneNumber?.toLowerCase().includes(searchTerm) ?? false) ||
                    name.includes(searchTerm)
                );
            });

            // Apply pagination manually
            const { numItems, cursor } = args.paginationOpts;
            let startIndex = 0;

            if (cursor) {
                // Find the index of the cursor in the filtered results
                const cursorIndex = filteredContacts.findIndex(c => c._id === cursor);
                if (cursorIndex !== -1) {
                    startIndex = cursorIndex + 1;
                }
            }

            const endIndex = startIndex + numItems;
            const page = filteredContacts.slice(startIndex, endIndex);
            const isDone = endIndex >= filteredContacts.length;
            const continueCursor = isDone ? null : page[page.length - 1]?._id ?? null;

            // Sanitize to exactly match the returns validator
            const sanitizedPage = page.map((c) => ({
                _id: c._id,
                _creationTime: c._creationTime,
                firstName: c.firstName,
                lastName: c.lastName,
                email: c.email,
                phoneNumber: c.phoneNumber,
                unsubscribed: c.unsubscribed,
            }));

            return { page: sanitizedPage, isDone, continueCursor };
        }

        // No search term - use normal pagination
        let queryBuilder = ctx.db
            .query("contacts")
            .withIndex("by_company", (q) => q.eq("companyId", company._id))
            .order("desc");

        // Apply unsubscribed filter by switching to combined index when needed
        if (unsubscribedFilter === "only" || unsubscribedFilter === "active") {
            const flag = unsubscribedFilter === "only";
            queryBuilder = ctx.db
                .query("contacts")
                .withIndex("by_company_and_unsubscribed", (q) =>
                    q.eq("companyId", company._id).eq("unsubscribed", flag),
                )
                .order("desc");
        }

        const result = await queryBuilder.paginate(args.paginationOpts);

        // Sanitize to exactly match the returns validator
        const sanitizedPage = result.page.map((c) => ({
            _id: c._id,
            _creationTime: c._creationTime,
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            phoneNumber: c.phoneNumber,
            unsubscribed: c.unsubscribed,
        }));

        return { page: sanitizedPage, isDone: result.isDone, continueCursor: result.continueCursor };
    },
});

export const add = mutation({
    args: {
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        email: v.optional(v.string()),
        phoneNumber: v.optional(v.string()),
        unsubscribed: v.optional(v.boolean()),
    },
    returns: v.id("contacts"),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Unauthorized");

        if (!args.email && !args.phoneNumber) {
            throw new Error("Minst e‑post eller telefon krävs");
        }

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

        const newId = await ctx.db.insert("contacts", {
            companyId: company._id,
            firstName: args.firstName,
            lastName: args.lastName,
            email: args.email,
            phoneNumber: args.phoneNumber,
            unsubscribed: args.unsubscribed ?? false,
            createdAt: Date.now(),
        });

        await ctx.db.insert("gdprLogs", {
            companyId: company._id,
            action: "contact_import", // closest log type for manual add in this phase
            userId,
            details: "Manual contact add",
            createdAt: Date.now(),
        });

        return newId;
    },
});

export const update = mutation({
    args: {
        contactId: v.id("contacts"),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        email: v.optional(v.string()),
        phoneNumber: v.optional(v.string()),
        unsubscribed: v.optional(v.boolean()),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Unauthorized");

        const contact = await ctx.db.get(args.contactId);
        if (!contact) throw new Error("Contact not found");

        const company = await ctx.db
            .query("companies")
            .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
            .unique();
        if (!company || contact.companyId !== company._id) throw new Error("Forbidden");

        if (!args.email && !args.phoneNumber && (contact.email === undefined && contact.phoneNumber === undefined)) {
            throw new Error("Minst e‑post eller telefon krävs");
        }

        await ctx.db.patch(args.contactId, {
            firstName: args.firstName,
            lastName: args.lastName,
            email: args.email,
            phoneNumber: args.phoneNumber,
            unsubscribed: args.unsubscribed ?? contact.unsubscribed,
        });

        return null;
    },
});

export const remove = mutation({
    args: { contactId: v.id("contacts") },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Unauthorized");

        const contact = await ctx.db.get(args.contactId);
        if (!contact) return null;

        const company = await ctx.db
            .query("companies")
            .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
            .unique();
        if (!company || contact.companyId !== company._id) throw new Error("Forbidden");

        await ctx.db.delete(args.contactId);

        await ctx.db.insert("gdprLogs", {
            companyId: company._id,
            action: "data_deletion",
            userId,
            contactId: args.contactId,
            details: "Manual contact deletion",
            createdAt: Date.now(),
        });

        return null;
    },
});

export const exportAll = query({
    args: {},
    returns: v.array(
        v.object({
            firstName: v.optional(v.string()),
            lastName: v.optional(v.string()),
            email: v.optional(v.string()),
            phoneNumber: v.optional(v.string()),
            unsubscribed: v.boolean(),
            createdAt: v.number(),
        }),
    ),
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) throw new Error("Unauthorized");

        const company = await ctx.db
            .query("companies")
            .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
            .unique();
        if (!company) return [];

        const rows = await ctx.db
            .query("contacts")
            .withIndex("by_company", (q) => q.eq("companyId", company._id))
            .order("asc")
            .take(5000);

        return rows.map((r) => ({
            firstName: r.firstName,
            lastName: r.lastName,
            email: r.email,
            phoneNumber: r.phoneNumber,
            unsubscribed: r.unsubscribed,
            createdAt: r.createdAt,
        }));
    },
});


