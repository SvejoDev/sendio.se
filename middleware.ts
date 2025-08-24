import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/signin"]);
// Only landing page and /signin are public
const isPublicRoute = createRouteMatcher(["/", "/signin"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthed = await convexAuth.isAuthenticated();

  // If authed user hits /signin, send to primary app page
  if (isSignInPage(request) && isAuthed) {
    return nextjsMiddlewareRedirect(request, "/contacts/import");
  }

  // If route is not public and user is not authed, redirect to /signin
  // Avoid redirecting /signin to itself
  if (!isPublicRoute(request) && !isAuthed) {
    return nextjsMiddlewareRedirect(request, "/signin");
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};