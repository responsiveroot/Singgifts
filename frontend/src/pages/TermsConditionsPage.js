import React from 'react';

function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h1 className="text-4xl font-playfair font-bold mb-8">Terms & Conditions</h1>
          
          <div className="space-y-6 text-gray-700 font-inter">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using SingGifts, you accept and agree to be bound by these Terms and Conditions.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Products and Pricing</h2>
              <p>All products are subject to availability. Prices are in Singapore Dollars (SGD) unless otherwise specified and may change without notice.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Orders and Payment</h2>
              <p>By placing an order, you agree to provide accurate information. Payment must be received before order processing.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Shipping and Delivery</h2>
              <p>Delivery times are estimates. SingGifts is not responsible for delays caused by shipping carriers or customs.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Returns and Refunds</h2>
              <p>Products can be returned within 14 days of delivery. See our Refund Policy for details.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Intellectual Property</h2>
              <p>All content on SingGifts is owned by us or our licensors. Unauthorized use is prohibited.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
              <p>SingGifts is not liable for indirect, incidental, or consequential damages arising from use of our services.</p>
            </section>

            <p className="text-sm text-gray-500 mt-8">Last updated: January 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsConditionsPage;