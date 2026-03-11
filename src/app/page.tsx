import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tools = [
  {
    name: "JSON Formatter & Validator",
    description: "Format, validate, and minify JSON data instantly.",
    href: "/tools/json-formatter",
    icon: "{ }",
    tags: ["Format", "Validate", "Minify"],
  },
  {
    name: "Diff Checker",
    description: "Compare two texts or code blocks side by side.",
    href: "/tools/diff-checker",
    icon: "<>",
    tags: ["Compare", "Text", "Code"],
  },
  {
    name: "JWT Decoder",
    description: "Decode and inspect JSON Web Tokens securely.",
    href: "/tools/jwt-decoder",
    icon: "JWT",
    tags: ["Decode", "Security", "Auth"],
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Free Developer Tools
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Fast, free, and private. All tools run{" "}
          <span className="text-foreground font-semibold">
            100% in your browser
          </span>
          . No data is ever sent to our servers.
        </p>
        <Badge variant="secondary" className="text-sm">
          No sign-up required
        </Badge>
      </section>

      {/* Tools Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-sm font-mono font-bold text-primary">
                    {tool.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {tool.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {tool.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {tool.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </section>

      {/* Privacy Banner */}
      <section className="text-center py-8 border rounded-lg bg-card">
        <h2 className="text-lg font-semibold mb-2">Your Privacy Matters</h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          We strictly do not store any of your data. Everything is processed
          locally in your browser using JavaScript. No server-side processing, no
          cookies, no tracking of your input data.
        </p>
      </section>
    </div>
  );
}
