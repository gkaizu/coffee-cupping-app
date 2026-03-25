import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/presigned-url", "routes/api.presigned-url.ts"),
] satisfies RouteConfig;
