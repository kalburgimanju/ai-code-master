'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Calendar, Users, CreditCard, CheckCircle2, Loader2, MapPin, Mail, Phone, User } from 'lucide-react';
import { destinations, tripPlans, hotels } from '@/data/destinations';

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

type Step = 'details' | 'payment' | 'confirmation';

function BookingForm() {
  const searchParams = useSearchParams();
  const destId = searchParams.get('dest');
  const tripId = searchParams.get('trip');
  const guestsParam = searchParams.get('guests');

  const [step, setStep] = useState<Step>('details');
  const [isProcessing, setIsProcessing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    destination: destId || '',
    tripPlan: tripId || '',
    hotel: '',
    checkIn: '',
    checkOut: '',
    guests: guestsParam || '2',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });

  const selectedDest = destinations.find((d) => d.id === form.destination);
  const selectedTrip = tripPlans.find((tp) => tp.id === form.tripPlan);
  const selectedHotel = hotels.find((h) => h.id === form.hotel);
  const destHotels = form.destination ? hotels.filter((h) => h.destinationId === form.destination) : hotels;

  const totalCost = selectedTrip
    ? selectedTrip.price * Number(form.guests)
    : selectedHotel
      ? selectedHotel.pricePerNight * Math.max(1, Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / 86400000)) * Number(form.guests)
      : 0;

  const canProceedDetails = form.name && form.email && form.phone && form.destination;
  const canProceedPayment = form.cardNumber.length >= 16 && form.cardExpiry && form.cardCvv.length >= 3;

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 2500));
    setIsProcessing(false);
    setStep('confirmation');
  };

  const steps = [
    { key: 'details', label: 'Details', icon: <User size={16} /> },
    { key: 'payment', label: 'Payment', icon: <CreditCard size={16} /> },
    { key: 'confirmation', label: 'Confirmation', icon: <CheckCircle2 size={16} /> },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium ${
              step === s.key ? 'bg-brand-500 text-white' :
              steps.findIndex((x) => x.key === step) > i ? 'bg-green-100 text-green-700' :
              'bg-dark-100 text-dark-400'
            }`}>
              {steps.findIndex((x) => x.key === step) > i ? <CheckCircle2 size={16} /> : s.icon}
              {s.label}
            </div>
            {i < steps.length - 1 && <div className="w-8 h-px bg-dark-200" />}
          </div>
        ))}
      </div>

      {/* Step 1: Details */}
      {step === 'details' && (
        <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-8">
          <h2 className="text-xl font-bold text-dark-800 mb-6">Booking Details</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">Full Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm" placeholder="John Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">Email *</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm" placeholder="john@email.com" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1">Phone *</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm" placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">Destination *</label>
                <select value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value, tripPlan: '', hotel: '' })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm">
                  <option value="">Select destination</option>
                  {destinations.map((d) => (<option key={d.id} value={d.id}>{d.name}, {d.country}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">Trip Plan</label>
                <select value={form.tripPlan} onChange={(e) => setForm({ ...form, tripPlan: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm">
                  <option value="">No trip plan</option>
                  {tripPlans.filter((tp) => !form.destination || tp.destinationId === form.destination).map((tp) => (
                    <option key={tp.id} value={tp.id}>{tp.name} — {formatCurrency(tp.price)}/person</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">Hotel</label>
                <select value={form.hotel} onChange={(e) => setForm({ ...form, hotel: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm">
                  <option value="">Select hotel</option>
                  {destHotels.map((h) => (<option key={h.id} value={h.id}>{h.name} — {formatCurrency(h.pricePerNight)}/night</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">Guests</label>
                <input type="number" min={1} max={20} value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">Check-in</label>
                <input type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">Check-out</label>
                <input type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm" />
              </div>
            </div>
          </div>

          {/* Summary */}
          {totalCost > 0 && (
            <div className="mt-6 bg-brand-50 rounded-xl p-4 border border-brand-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-600">Estimated Total ({form.guests} guests)</span>
                <span className="text-xl font-extrabold text-brand-700">{formatCurrency(totalCost)}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => setStep('payment')}
            disabled={!canProceedDetails}
            className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-ocean-500 text-white font-semibold text-sm hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Continue to Payment →
          </button>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 'payment' && (
        <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-8">
          <h2 className="text-xl font-bold text-dark-800 mb-6">Payment Details</h2>

          {/* Booking summary */}
          <div className="bg-dark-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              {selectedDest && <img src={selectedDest.image} alt="" className="w-12 h-12 rounded-lg object-cover" />}
              <div>
                <p className="font-semibold text-dark-800">{selectedDest?.name || 'Custom Trip'}</p>
                <p className="text-xs text-dark-400">{form.guests} guests · {form.checkIn} to {form.checkOut}</p>
              </div>
            </div>
            {selectedTrip && (
              <div className="flex justify-between text-sm text-dark-600 mt-2 pt-2 border-t border-dark-200">
                <span>{selectedTrip.name} × {form.guests}</span>
                <span className="font-semibold">{formatCurrency(selectedTrip.price * Number(form.guests))}</span>
              </div>
            )}
            {selectedHotel && (
              <div className="flex justify-between text-sm text-dark-600 mt-1">
                <span>{selectedHotel.name}</span>
                <span className="font-semibold">{formatCurrency(selectedHotel.pricePerNight)}/night</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-dark-800 mt-2 pt-2 border-t border-dark-200">
              <span>Total</span>
              <span className="text-brand-600">{formatCurrency(totalCost)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-600 mb-1">Card Number</label>
              <input type="text" maxLength={19} value={form.cardNumber}
                onChange={(e) => setForm({ ...form, cardNumber: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() })}
                className="w-full px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm" placeholder="4242 4242 4242 4242" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">Expiry</label>
                <input type="text" maxLength={5} value={form.cardExpiry}
                  onChange={(e) => setForm({ ...form, cardExpiry: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm" placeholder="MM/YY" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-1">CVV</label>
                <input type="text" maxLength={4} value={form.cardCvv}
                  onChange={(e) => setForm({ ...form, cardCvv: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm" placeholder="123" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep('details')} className="px-6 py-3 rounded-xl border border-dark-200 text-dark-600 font-semibold text-sm hover:bg-dark-50 transition-colors">
              ← Back
            </button>
            <button onClick={handleConfirmBooking} disabled={!canProceedPayment || isProcessing}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-ocean-500 text-white font-semibold text-sm hover:shadow-lg disabled:opacity-40 transition-all">
              {isProcessing ? (<><Loader2 size={16} className="animate-spin" /> Processing...</>) : (`Pay ${formatCurrency(totalCost)}`)}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 'confirmation' && (
        <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-dark-800 mb-2">Booking Confirmed! 🎉</h2>
          <p className="text-dark-500 mb-6">
            Your trip to <strong>{selectedDest?.name || 'your destination'}</strong> has been booked successfully.
          </p>
          <div className="bg-dark-50 rounded-xl p-4 max-w-md mx-auto text-left mb-6">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-dark-400">Name:</span> <span className="font-medium text-dark-800">{form.name}</span></div>
              <div><span className="text-dark-400">Email:</span> <span className="font-medium text-dark-800">{form.email}</span></div>
              <div><span className="text-dark-400">Guests:</span> <span className="font-medium text-dark-800">{form.guests}</span></div>
              <div><span className="text-dark-400">Total:</span> <span className="font-bold text-brand-600">{formatCurrency(totalCost)}</span></div>
              <div><span className="text-dark-400">Booking ID:</span> <span className="font-medium text-dark-800">ATL-{Date.now().toString(36).toUpperCase()}</span></div>
              <div><span className="text-dark-400">Status:</span> <span className="font-medium text-green-600">Confirmed</span></div>
            </div>
          </div>
          <p className="text-sm text-dark-400 mb-6">
            A confirmation email has been sent to <strong>{form.email}</strong>. You can track your booking status in the Follow-up section.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/follow-up" className="px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-colors">
              Track Booking →
            </a>
            <a href="/" className="px-6 py-3 rounded-xl border border-dark-200 text-dark-600 font-semibold text-sm hover:bg-dark-50 transition-colors">
              Back to Home
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-dark-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-dark-900 mb-2">Book Your Trip</h1>
          <p className="text-dark-500">Complete your booking in just a few steps.</p>
        </div>
        <Suspense fallback={<div className="text-center py-20 text-dark-400">Loading...</div>}>
          <BookingForm />
        </Suspense>
      </div>
    </div>
  );
}
