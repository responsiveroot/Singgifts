import React from 'react';

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h1 className="text-4xl font-playfair font-bold mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-gray-700 font-inter">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
              <p>We collect information you provide when creating an account, placing orders, or contacting us. This includes your name, email, shipping address, and payment information.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations and updates</li>
                <li>Improve our products and services</li>
                <li>Communicate with you about promotions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Data Security</h2>
              <p>We implement industry-standard security measures to protect your personal information. Payment processing is handled securely through Stripe.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Cookies</h2>
              <p>We use cookies to enhance your browsing experience and remember your preferences.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Third-Party Services</h2>
              <p>We may share information with trusted third-party service providers who assist in operating our website and conducting our business.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal information. Contact us at privacy@singgifts.sg for requests.</p>
            </section>

            <p className="text-sm text-gray-500 mt-8">Last updated: January 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;