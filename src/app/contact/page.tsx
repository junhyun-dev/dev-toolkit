import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the DevToolKit team.",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Contact</h1>
        <p className="text-muted-foreground mt-2">
          Have questions, feedback, or suggestions? We&apos;d love to hear from
          you.
        </p>
      </div>

      <section className="space-y-4 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">Get in Touch</h2>
        <p>
          For general inquiries, bug reports, or feature requests, please reach
          out via email:
        </p>
        <p className="text-foreground font-mono">
          contact@devtoolkit.cc
        </p>
        <p>We typically respond within 1-2 business days.</p>
      </section>

      <section className="space-y-4 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">
          Report a Bug
        </h2>
        <p>
          Found something that doesn&apos;t work as expected? Please include the
          following information when reporting:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Which tool you were using</li>
          <li>What you expected to happen</li>
          <li>What actually happened</li>
          <li>Your browser and operating system</li>
        </ul>
      </section>

      <section className="space-y-4 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">
          Feature Requests
        </h2>
        <p>
          Have an idea for a new tool or feature? We&apos;re always looking to
          expand our toolkit based on developer needs. Send us your suggestions
          and we&apos;ll consider them for future updates.
        </p>
      </section>
    </div>
  );
}
