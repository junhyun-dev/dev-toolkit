import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "DevToolKit privacy policy. Your data never leaves your browser.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">Last updated: March 2026</p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Overview</h2>
          <p>
            DevToolKit (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is
            committed to protecting your privacy. This Privacy Policy explains
            how we handle information when you use our website and tools.
          </p>
          <p className="text-foreground font-semibold">
            The short version: We do not collect, store, or transmit any of
            your input data. All tools run entirely in your browser.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Data Processing
          </h2>
          <p>
            All data processing (JSON formatting, text comparison, JWT
            decoding, etc.) happens exclusively in your web browser using
            client-side JavaScript. No input data is ever sent to our servers
            or any third-party services.
          </p>
          <p>
            You can verify this by opening your browser&apos;s Developer Tools
            (F12) and checking the Network tab while using any of our tools.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Analytics
          </h2>
          <p>
            We use Google Analytics to understand how visitors use our site.
            This collects anonymous usage data such as page views, browser
            type, and country. It does not track the content you input into
            our tools.
          </p>
          <p>
            You can opt out of Google Analytics by using a browser extension
            such as Google Analytics Opt-out Browser Add-on.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Cookies</h2>
          <p>
            Our site may use cookies for analytics purposes (Google Analytics)
            and advertising (Google AdSense). These are third-party cookies
            and do not contain any of your input data.
          </p>
          <p>
            You can manage cookie preferences through your browser settings or
            through the cookie consent banner on our site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Third-Party Services
          </h2>
          <p>We may use the following third-party services:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Google Analytics</strong> — for anonymous usage
              statistics
            </li>
            <li>
              <strong>Google AdSense</strong> — for displaying advertisements
            </li>
            <li>
              <strong>Amazon Associates</strong> — for product
              recommendations (affiliate links)
            </li>
          </ul>
          <p>
            Each of these services has its own privacy policy governing data
            collection.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            Affiliate Disclosure
          </h2>
          <p>
            DevToolKit is a participant in the Amazon Services LLC Associates
            Program, an affiliate advertising program designed to provide a
            means for sites to earn advertising fees by advertising and
            linking to Amazon.com. As an Amazon Associate, we earn from
            qualifying purchases.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">
            GDPR Compliance
          </h2>
          <p>
            For users in the European Economic Area (EEA), we comply with the
            General Data Protection Regulation (GDPR). Since we do not collect
            personal input data, data subject access requests regarding tool
            usage are not applicable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p>
            If you have any questions about this Privacy Policy, please
            contact us at contact@devtoolkit.com.
          </p>
        </section>
      </div>
    </div>
  );
}
