import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: 'How do I track my order?', a: 'Visit your dashboard and click on your order to view tracking information.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, debit cards through Stripe secure payment gateway.' },
    { q: 'Do you ship internationally?', a: 'Yes! We ship to over 50 countries worldwide. International shipping takes 5-10 business days.' },
    { q: 'Can I change my order after placing it?', a: 'Contact us immediately at support@singgifts.sg. We can modify orders before they ship.' },
    { q: 'What if my item arrives damaged?', a: 'Contact us within 48 hours with photos. We\'ll arrange a replacement or full refund.' },
    { q: 'Do you offer gift wrapping?', a: 'Yes! Select gift wrapping option at checkout for SGD 5.' },
    { q: 'How long does shipping take?', a: 'Singapore: 2-3 business days. International: 5-10 business days.' },
    { q: 'What is your return policy?', a: '14-day return window. Items must be unused in original packaging.' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-playfair font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600 font-inter">Find answers to common questions</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-bold text-lg">{faq.q}</h3>
                {openIndex === index ? <ChevronUp className="text-primary" /> : <ChevronDown className="text-primary" />}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-700">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-primary text-white rounded-xl p-8 text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="mb-6">Contact our friendly support team</p>
          <a href="/contact" className="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-gray-100 inline-block">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}

export default FAQPage;