'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { MessageCircle, Phone, X, AlertCircle } from 'lucide-react';
import { validateName, validateMobileNumber, validateEmail } from '@/lib/validators';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCY_LEVELS = [
  { value: 'NORMAL', label: 'Normal', color: 'text-blue-600' },
  { value: 'URGENT', label: 'Urgent', color: 'text-orange-600' },
  { value: 'EMERGENCY', label: 'Emergency', color: 'text-red-600' },
];

export default function NeedABloodPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    bloodGroup: '',
    unitsNeeded: '1',
    urgency: 'NORMAL',
    neededBy: '',
    notes: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Fetch WhatsApp contact info
  useEffect(() => {
    const fetchWhatsAppInfo = async () => {
      try {
        console.log('🔍 Fetching WhatsApp info...');
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/about`
        );
        console.log('📦 API Response:', response.data);
        const aboutData = response.data.data;
        console.log('📱 WhatsApp Data:', {
          enabled: aboutData?.whatsappEnabled,
          number: aboutData?.whatsappNumber
        });
        if (aboutData && aboutData.whatsappEnabled) {
          setWhatsappEnabled(true);
          setWhatsappNumber(aboutData.whatsappNumber || '');
          console.log('✅ WhatsApp button enabled with number:', aboutData.whatsappNumber);
        } else {
          console.log('❌ WhatsApp not enabled or data missing');
        }
      } catch (error) {
        console.error('❌ Failed to fetch WhatsApp info:', error);
      }
    };
    fetchWhatsAppInfo();
  }, []);

  // Helper function to clean phone number for WhatsApp
  const getCleanWhatsAppNumber = (number: string) => {
    // Remove all non-numeric characters
    const cleaned = number.replace(/[^0-9]/g, '');
    console.log('🧹 Cleaned WhatsApp number:', { original: number, cleaned });
    return cleaned;
  };

  // Validate individual field
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'name':
        const nameValidation = validateName(value);
        return nameValidation.isValid ? null : nameValidation.message || null;
      
      case 'phone':
        const phoneValidation = validateMobileNumber(value);
        return phoneValidation.isValid ? null : phoneValidation.message || null;
      
      case 'email':
        if (!value) return null; // Email is optional
        const emailValidation = validateEmail(value);
        return emailValidation.isValid ? null : emailValidation.message || null;
      
      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.trim().length < 10) return 'Address must be at least 10 characters';
        return null;
      
      case 'bloodGroup':
        if (!value) return 'Blood group is required';
        return null;
      
      case 'unitsNeeded':
        const units = parseInt(value);
        if (isNaN(units) || units < 1) return 'At least 1 unit is required';
        if (units > 2) return 'Maximum 2 units allowed per request';
        return null;
      
      case 'neededBy':
        if (!value) return 'Date and time is required';
        const selectedDate = new Date(value);
        const now = new Date();
        if (selectedDate < now) return 'Date must be in the future';
        return null;
      
      default:
        return null;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate field if it has been touched
    if (touchedFields[name]) {
      const error = validateField(name, value);
      setFieldErrors(prev => ({
        ...prev,
        [name]: error || '',
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setTouchedFields(prev => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const errors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        errors[key] = error;
      }
    });

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouchedFields(allTouched);

    // If there are errors, show them and don't submit
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please fix all validation errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/blood-requests`,
        formData
      );

      if (response.data.status === 'success') {
        alert('Blood request submitted successfully! Our team will review it shortly.');
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit blood request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Need Blood?</h1>
          <p className="text-lg text-gray-600">
            Submit your blood request and our team will help you
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  fieldErrors.name && touchedFields.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {fieldErrors.name && touchedFields.name && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.name}</span>
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  fieldErrors.phone && touchedFields.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter 10-digit phone number"
              />
              {fieldErrors.phone && touchedFields.phone && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.phone}</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  fieldErrors.email && touchedFields.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {fieldErrors.email && touchedFields.email && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.email}</span>
                </div>
              )}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                required
                rows={3}
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  fieldErrors.address && touchedFields.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your complete address"
              />
              {fieldErrors.address && touchedFields.address && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.address}</span>
                </div>
              )}
            </div>

            {/* Blood Group and Units */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group <span className="text-red-500">*</span>
                </label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  required
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    fieldErrors.bloodGroup && touchedFields.bloodGroup ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
                {fieldErrors.bloodGroup && touchedFields.bloodGroup && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{fieldErrors.bloodGroup}</span>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="unitsNeeded" className="block text-sm font-medium text-gray-700 mb-2">
                  Units Needed <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="unitsNeeded"
                  name="unitsNeeded"
                  required
                  min="1"
                  max="2"
                  value={formData.unitsNeeded}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    fieldErrors.unitsNeeded && touchedFields.unitsNeeded ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">Maximum 2 units per request</p>
                {fieldErrors.unitsNeeded && touchedFields.unitsNeeded && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{fieldErrors.unitsNeeded}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Level <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                {URGENCY_LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.urgency === level.value
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={level.value}
                      checked={formData.urgency === level.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className={`font-medium ${level.color}`}>{level.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Needed By */}
            <div>
              <label htmlFor="neededBy" className="block text-sm font-medium text-gray-700 mb-2">
                When do you need it? <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="neededBy"
                name="neededBy"
                required
                value={formData.neededBy}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  fieldErrors.neededBy && touchedFields.neededBy ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {fieldErrors.neededBy && touchedFields.neededBy && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{fieldErrors.neededBy}</span>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Any additional information..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-start">
              <span className="mr-2">1.</span>
              <span>Our team will review your request within 24 hours</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">2.</span>
              <span>We'll check blood availability in our stock</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">3.</span>
              <span>You'll be contacted via phone or email with next steps</span>
            </li>
          </ul>
        </div>


      </div>

      {/* Floating WhatsApp Contact Button */}
      {whatsappEnabled && whatsappNumber && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          {/* Pulse Animation - Behind button */}
          <div className="absolute inset-0 w-16 h-16 bg-green-500 rounded-full animate-ping opacity-20 pointer-events-none"></div>
          
          {/* WhatsApp Menu */}
          {showWhatsAppMenu && (
            <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl p-4 w-64 border border-gray-200 z-[10000]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Contact Admin</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowWhatsAppMenu(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {/* WhatsApp Message */}
                <a
                  href={`https://wa.me/${getCleanWhatsAppNumber(whatsappNumber)}?text=${encodeURIComponent('Hello, I need blood urgently. Can you help me?')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors border border-gray-200 cursor-pointer"
                  onClick={() => {
                    const cleanNumber = getCleanWhatsAppNumber(whatsappNumber);
                    console.log('📱 WhatsApp clicked with number:', cleanNumber);
                    console.log('🔗 Full URL:', `https://wa.me/${cleanNumber}`);
                  }}
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">Send Message</p>
                    <p className="text-xs text-gray-500">Chat on WhatsApp</p>
                  </div>
                </a>

                {/* Phone Call */}
                <a
                  href={`tel:${whatsappNumber}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200 cursor-pointer"
                  onClick={() => {
                    console.log('📞 Call clicked with number:', whatsappNumber);
                  }}
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">Call Now</p>
                    <p className="text-xs text-gray-500">{whatsappNumber}</p>
                  </div>
                </a>
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Available 24/7 for emergencies
              </p>
            </div>
          )}

          {/* WhatsApp Button - On top */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Button clicked! Current state:', showWhatsAppMenu);
              setShowWhatsAppMenu(!showWhatsAppMenu);
            }}
            type="button"
            className="relative w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer z-[10001]"
            aria-label="Contact via WhatsApp"
            style={{ pointerEvents: 'auto' }}
          >
            <MessageCircle className="h-8 w-8 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
