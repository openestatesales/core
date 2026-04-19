import type { NextConfig } from "next";

const remotePatterns: NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/**",
  },
];

/** Local Supabase API ports (config.toml may use non-default e.g. 54331). */
const LOCAL_SUPABASE_PORTS = ["54321", "54322", "54331"] as const;

for (const hostname of ["127.0.0.1", "localhost"] as const) {
  for (const port of LOCAL_SUPABASE_PORTS) {
    remotePatterns.push({
      protocol: "http",
      hostname,
      port,
      pathname: "/storage/v1/object/public/**",
    });
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    remotePatterns.push({
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: "/storage/v1/object/public/**",
    });
  } catch {
    /* ignore invalid env */
  }
}

/** Next 16+ blocks optimizing images whose host resolves to a private IP (SSRF guard). Local Supabase Storage URLs use 127.0.0.1 — allow only in that case. */
function supabaseStorageUsesLoopback(urlStr: string | undefined): boolean {
  if (!urlStr) return false;
  try {
    const { hostname } = new URL(urlStr);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1"
    );
  } catch {
    return false;
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
    dangerouslyAllowLocalIP: supabaseStorageUsesLoopback(supabaseUrl),
  },
};

export default nextConfig;
