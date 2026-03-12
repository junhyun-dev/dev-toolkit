"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Permission = { read: boolean; write: boolean; execute: boolean };
type Permissions = { owner: Permission; group: Permission; others: Permission };

const DEFAULT_PERMISSIONS: Permissions = {
  owner: { read: true, write: true, execute: false },
  group: { read: true, write: false, execute: false },
  others: { read: true, write: false, execute: false },
};

function permToOctal(p: Permission): number {
  return (p.read ? 4 : 0) + (p.write ? 2 : 0) + (p.execute ? 1 : 0);
}

function permToSymbolic(p: Permission): string {
  return `${p.read ? "r" : "-"}${p.write ? "w" : "-"}${p.execute ? "x" : "-"}`;
}

function octalToPermission(n: number): Permission {
  return {
    read: (n & 4) !== 0,
    write: (n & 2) !== 0,
    execute: (n & 1) !== 0,
  };
}

function octalStringToPermissions(octal: string): Permissions | null {
  if (!/^[0-7]{3}$/.test(octal)) return null;
  const [o, g, ot] = octal.split("").map(Number);
  return {
    owner: octalToPermission(o),
    group: octalToPermission(g),
    others: octalToPermission(ot),
  };
}

const PRESETS: { label: string; value: string; description: string }[] = [
  { label: "644", value: "644", description: "Files: owner rw, group/others r" },
  { label: "755", value: "755", description: "Dirs/scripts: owner rwx, others rx" },
  { label: "700", value: "700", description: "Private: owner only" },
  { label: "777", value: "777", description: "Full access (not recommended)" },
  { label: "600", value: "600", description: "Private files: owner rw only" },
  { label: "664", value: "664", description: "Group-writable files" },
];

export default function ChmodCalculatorPage() {
  const [perms, setPerms] = useState<Permissions>(DEFAULT_PERMISSIONS);
  const [octalInput, setOctalInput] = useState("644");
  const [copied, setCopied] = useState(false);

  const octalValue =
    `${permToOctal(perms.owner)}${permToOctal(perms.group)}${permToOctal(perms.others)}`;
  const symbolicValue =
    `${permToSymbolic(perms.owner)}${permToSymbolic(perms.group)}${permToSymbolic(perms.others)}`;
  const chmodCommand = `chmod ${octalValue} filename`;

  const togglePerm = useCallback(
    (role: keyof Permissions, bit: keyof Permission) => {
      setPerms((prev) => ({
        ...prev,
        [role]: { ...prev[role], [bit]: !prev[role][bit] },
      }));
      setOctalInput(""); // clear manual input when using checkboxes
    },
    []
  );

  const applyOctal = useCallback(() => {
    const result = octalStringToPermissions(octalInput);
    if (result) setPerms(result);
  }, [octalInput]);

  const applyPreset = useCallback((value: string) => {
    const result = octalStringToPermissions(value);
    if (result) {
      setPerms(result);
      setOctalInput(value);
    }
  }, []);

  const copyCommand = useCallback(async () => {
    await navigator.clipboard.writeText(chmodCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [chmodCommand]);

  const roles: { key: keyof Permissions; label: string }[] = [
    { key: "owner", label: "Owner (u)" },
    { key: "group", label: "Group (g)" },
    { key: "others", label: "Others (o)" },
  ];

  const bits: { key: keyof Permission; label: string; value: number }[] = [
    { key: "read", label: "Read (r)", value: 4 },
    { key: "write", label: "Write (w)", value: 2 },
    { key: "execute", label: "Execute (x)", value: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Chmod Calculator</h1>
        <p className="text-muted-foreground mt-1">
          Calculate Unix/Linux file permissions. Toggle checkboxes to build your
          chmod value instantly.
        </p>
        <Badge variant="secondary" className="mt-2">
          No data sent to server
        </Badge>
      </div>

      {/* Main Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Checkbox Grid */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Permission Selector</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {/* Header row */}
              <div className="grid grid-cols-4 gap-2 pb-2 border-b border-border">
                <div className="text-xs text-muted-foreground font-medium"></div>
                {bits.map((bit) => (
                  <div key={bit.key} className="text-xs text-muted-foreground font-medium text-center">
                    {bit.label}
                  </div>
                ))}
              </div>
              {/* Permission rows */}
              {roles.map((role) => (
                <div key={role.key} className="grid grid-cols-4 gap-2 py-3">
                  <div className="text-sm font-medium self-center">{role.label}</div>
                  {bits.map((bit) => (
                    <div key={bit.key} className="flex justify-center">
                      <label className="flex flex-col items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={perms[role.key][bit.key]}
                          onChange={() => togglePerm(role.key, bit.key)}
                          className="w-5 h-5 rounded cursor-pointer"
                        />
                        <span className="text-xs text-muted-foreground">
                          {perms[role.key][bit.key] ? bit.value : 0}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Result Display */}
        <div className="space-y-4">
          {/* Numeric + Symbolic */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-md bg-muted border border-border">
                <span className="text-sm text-muted-foreground">Numeric</span>
                <span className="text-3xl font-bold font-mono tracking-widest">
                  {octalValue}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-md bg-muted border border-border">
                <span className="text-sm text-muted-foreground">Symbolic</span>
                <span className="text-xl font-bold font-mono tracking-widest">
                  {symbolicValue}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-md bg-muted border border-border">
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Command</span>
                  <code className="font-mono text-sm">{chmodCommand}</code>
                </div>
                <Button variant="ghost" size="sm" onClick={copyCommand}>
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Octal Input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Enter Octal Directly</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={3}
                  placeholder="e.g. 755"
                  value={octalInput}
                  onChange={(e) => setOctalInput(e.target.value.replace(/[^0-7]/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && applyOctal()}
                  className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button onClick={applyOctal}>Apply</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Common Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => applyPreset(preset.value)}
                className={`text-left px-4 py-3 rounded-md border transition-colors ${
                  octalValue === preset.value
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted hover:bg-muted/80"
                }`}
              >
                <div className="font-mono font-bold text-lg">{preset.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{preset.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Related Tools */}
      <section className="py-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Hash Generator", href: "/tools/hash-generator" },
            { name: "UUID Generator", href: "/tools/uuid-generator" },
            { name: "Cron Generator", href: "/tools/cron-generator" },
            { name: "JWT Decoder", href: "/tools/jwt-decoder" },
          ].map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              className="text-xs px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            >
              {tool.name}
            </a>
          ))}
        </div>
      </section>

      {/* SEO Content */}
      <section className="space-y-4 py-8 border-t">
        <Tabs defaultValue="what">
          <TabsList>
            <TabsTrigger value="what">What is Chmod?</TabsTrigger>
            <TabsTrigger value="how">How to Use</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="what" className="prose prose-invert max-w-none mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">What is Chmod?</h2>
            <p>
              <code>chmod</code> (change mode) is a Unix/Linux command used to
              set file and directory permissions. Permissions control who can
              read, write, or execute a file — for the owner, the group, and
              all other users.
            </p>
            <h3 className="text-base font-semibold text-foreground">Numeric vs. Symbolic Notation</h3>
            <p>
              Permissions can be expressed as a 3-digit octal number (like 755)
              or as a symbolic string (like rwxr-xr-x). Each digit represents
              one class of user: owner, group, others. Each bit within a digit
              represents read (4), write (2), and execute (1) permissions.
            </p>
          </TabsContent>

          <TabsContent value="how" className="prose prose-invert max-w-none mt-4 space-y-3 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">How to Use This Tool</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Check/uncheck boxes in the permission grid to set permissions.</li>
              <li>Or type an octal value (like 755) in the direct input box and click Apply.</li>
              <li>Or click one of the common presets for instant setup.</li>
              <li>Copy the generated chmod command to use in your terminal.</li>
            </ol>
          </TabsContent>

          <TabsContent value="faq" className="prose prose-invert max-w-none mt-4 space-y-4 text-muted-foreground text-sm">
            <h2 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h2>
            <div>
              <h3 className="text-sm font-semibold text-foreground">What does 755 mean?</h3>
              <p>
                755 means the owner has read, write, and execute (7 = 4+2+1)
                permissions, while group and others have read and execute (5 =
                4+1) permissions. This is the standard setting for web
                directories and executable scripts.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Should I ever use 777?</h3>
              <p>
                Rarely. 777 gives everyone full read, write, and execute
                permissions. This is a security risk on servers because it
                allows any user to modify or execute the file.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Support */}
      <div className="mt-8 text-center py-6 border rounded-lg bg-card">
        <p className="text-muted-foreground text-sm">
          Enjoying this tool?{" "}
          <a href="https://buymeacoffee.com/devtoolkit" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            ☕ Buy me a coffee
          </a>
          {" "} to support free tools!
        </p>
      </div>
    </div>
  );
}
