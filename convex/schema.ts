import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),

  // Company profiles (extends user data)
  companies: defineTable({
    userId: v.id("users"),
    companyName: v.string(),
    companyLogo: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Contact lists
  contacts: defineTable({
    companyId: v.id("companies"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    // New granular unsubscribe flags
    unsubscribedSms: v.optional(v.boolean()),
    unsubscribedEmail: v.optional(v.boolean()),
    unsubscribed: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_company_and_unsubscribed", ["companyId", "unsubscribed"])
    .index("by_email", ["email"])
    .index("by_phone", ["phoneNumber"]),

  // Campaigns
  campaigns: defineTable({
    companyId: v.id("companies"),
    name: v.string(),
    type: v.union(v.literal("sms"), v.literal("email"), v.literal("both")),
    status: v.union(v.literal("draft"), v.literal("paid"), v.literal("sent")),
    content: v.object({}), // SMS message or email content
    recipientCount: v.number(),
    totalCost: v.number(),
    createdAt: v.number(),
    // Track one free test send state to avoid TOCTOU
    testInProgress: v.optional(v.boolean()),
    testConsumed: v.optional(v.boolean()),
    // Track number of successful test sends (max 5)
    testCount: v.optional(v.number()),
  })
    .index("by_company", ["companyId"])
    .index("by_company_and_status", ["companyId", "status"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  // Campaign analytics and tracking
  campaignAnalytics: defineTable({
    campaignId: v.id("campaigns"),
    contactId: v.optional(v.id("contacts")),
    type: v.union(v.literal("sms"), v.literal("email")),
    status: v.union(
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("failed"),
      v.literal("bounced"),
      v.literal("opened"),
      v.literal("clicked"),
      v.literal("unsubscribed")
    ),
    sentAt: v.number(),
    deliveredAt: v.optional(v.number()),
    openedAt: v.optional(v.number()),
    clickedAt: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    // Mark analytics rows originating from free test sends
    isTest: v.optional(v.boolean()),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_campaign_and_type", ["campaignId", "type"])
    .index("by_contact", ["contactId"])
    .index("by_status", ["status"]),

  // Unsubscribe tokens for GDPR compliance
  unsubscribeTokens: defineTable({
    campaignId: v.id("campaigns"),
    contactId: v.id("contacts"),
    token: v.string(),
    type: v.union(v.literal("sms"), v.literal("email")),
    used: v.boolean(),
    usedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_campaign", ["campaignId"])
    .index("by_contact", ["contactId"])
    .index("by_type", ["type"]),

  // GDPR compliance logging
  gdprLogs: defineTable({
    companyId: v.id("companies"),
    action: v.union(
      v.literal("consent_given"),
      v.literal("consent_withdrawn"),
      v.literal("data_export"),
      v.literal("data_deletion"),
      v.literal("unsubscribe"),
      v.literal("contact_import")
    ),
    userId: v.optional(v.id("users")),
    contactId: v.optional(v.id("contacts")),
    campaignId: v.optional(v.id("campaigns")),
    details: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_action", ["action"])
    .index("by_user", ["userId"])
    .index("by_contact", ["contactId"])
    .index("by_campaign", ["campaignId"]),

  // Permanent suppression list (Do-Not-Contact) to persist opt-outs across imports
  suppressions: defineTable({
    companyId: v.id("companies"),
    email: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    smsOptOut: v.optional(v.boolean()),
    emailOptOut: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_company_and_email", ["companyId", "email"])
    .index("by_company_and_phone", ["companyId", "phoneNumber"]),
});
