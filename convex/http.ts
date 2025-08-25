import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

// Minimal public redirector for short unsubscribe links like /u/{token}
// Not strictly required since Next.js handles /u/[token], but keep as example endpoint.
http.route({
    path: "/api/unsubscribe/resolve",
    method: "GET",
    handler: httpAction(async (ctx, req) => {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token") || "";
        const result = await ctx.runQuery(api.unsubscribe.resolveToken, { token });
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "content-type": "application/json" },
        });
    }),
});

export default http;
