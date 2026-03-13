import type { MetadataRoute } from "next";

const BASE_URL = "https://www.devtoolkit.cc";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "Mediapartners-Google", allow: "/" },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
