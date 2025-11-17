import React from 'react';
import { Truck, Package, RefreshCw, Clock } from 'lucide-react';

function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-playfair font-bold text-center mb-12">Shipping & Returns</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center mb-4">
              <Truck className="text-primary mr-3" size={32} />
              <h2 className="text-2xl font-bold">Shipping Policy</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">Free Shipping</h3>
                <p>We offer free shipping on all orders within Singapore!</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Processing Time</h3>
                <p>Orders are processed within 1-2 business days</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Delivery Time</h3>
                <p>Singapore: 2-3 business days<br/>International: 5-10 business days</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center mb-4">
              <RefreshCw className="text-primary mr-3" size={32} />
              <h2 className="text-2xl font-bold">Returns Policy</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">Return Window</h3>
                <p>14 days from delivery date</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Condition</h3>
                <p>Items must be unused and in original packaging</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Refund Processing</h3>
                <p>Refunds issued within 5-7 business days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">How to Return</h2>
          <ol className="list-decimal ml-6 space-y-3 text-gray-700">
            <li>Contact us at support@singgifts.sg with your order number</li>
            <li>We'll provide a return authorization and instructions</li>
            <li>Pack items securely in original packaging</li>
            <li>Ship items back to our facility</li>
            <li>Receive your refund once items are inspected</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default ShippingReturnsPage;