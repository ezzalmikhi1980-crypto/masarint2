import React, { useState } from 'react';

export default function QuoteForm() {
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('LOADING');
    setErrorMessage('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setStatus('SUCCESS');
        form.reset();
      } else {
        setStatus('ERROR');
        setErrorMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setStatus('ERROR');
      setErrorMessage('Network error. Please try again later.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Request a Quote</h2>
      <p className="text-sm text-gray-600 mb-6">
        Fill out the form below and inquiries will be sent directly to info@almasarlogs.com.
      </p>

      {status === 'SUCCESS' ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <h3 className="font-semibold text-lg mb-1">Thank you!</h3>
          <p>Your quote inquiry has been sent successfully. We will get back to you shortly at info@almasarlogs.com.</p>
          <button
            onClick={() => setStatus('IDLE')}
            className="mt-4 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-md hover:bg-green-800 transition"
          >
            Send Another Inquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Web3Forms Access Key */}
          <input
            type="hidden"
            name="access_key"
            value="835e0b5a-21fc-4c35-a6c7-80a4ee17cc6b"
          />

          {/* Email Subject */}
          <input
            type="hidden"
            name="subject"
            value="New Quote Inquiry - Al Masar Logs"
          />

          {/* Honeypot for Bot Protection */}
          <input
            type="checkbox"
            name="botcheck"
            className="hidden"
            style={{ display: 'none' }}
          />

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Inquiry / Quote Details *
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              placeholder="Provide details about your logistics or shipment requirements..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            ></textarea>
          </div>

          {status === 'ERROR' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'LOADING'}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow transition disabled:opacity-50"
          >
            {status === 'LOADING' ? 'Sending Inquiry...' : 'Submit Quote Inquiry'}
          </button>
        </form>
      )}
    </div>
  );
}
