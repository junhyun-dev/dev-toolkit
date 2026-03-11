import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "DevToolKit terms of service and usage conditions.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-muted-foreground mt-2">Last updated: March 2026</p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Acceptance of Terms
          </h2>
          <p>
            By accessing and using DevToolKit, you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do
            not use our services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Description of Service
          </h2>
          <p>
            DevToolKit provides free online developer tools including but not
            limited to JSON formatting, text comparison, and JWT decoding.
            All tools process data exclusively in your web browser.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Disclaimer of Warranties
          </h2>
          <p>
            The tools are provided &quot;as is&quot; without any warranties,
            express or implied. We do not guarantee that the tools will be
            error-free, uninterrupted, or meet your specific requirements.
          </p>
          <p>
            While we strive for accuracy, you should always verify important
            results independently. Do not rely solely on our tools for
            critical operations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Limitation of Liability
          </h2>
          <p>
            DevToolKit shall not be liable for any direct, indirect,
            incidental, or consequential damages arising from the use of our
            tools. Use the tools at your own risk.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Acceptable Use
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Use the service for any illegal purpose</li>
            <li>
              Attempt to interfere with the proper operation of the website
            </li>
            <li>Use automated systems to access the service excessively</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Changes to Terms
          </h2>
          <p>
            We reserve the right to modify these terms at any time. Continued
            use of the service after changes constitutes acceptance of the new
            terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p>
            Questions about these Terms of Service? Contact us at
            contact@devtoolkit.com.
          </p>
        </section>
      </div>
    </div>
  );
}
