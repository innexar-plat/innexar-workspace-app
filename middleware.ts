import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "./src/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  response.headers.set(
    "Cache-Control",
    "no-cache, no-store, must-revalidate"
  );
  return response;
}

export const config = {
  matcher: [String.raw`/((?!api|_next|_vercel|.*\..*).*)`],
};
