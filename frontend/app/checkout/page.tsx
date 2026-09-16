'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ShopLayout from '@/components/templates/ShopLayout';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import Price from '@/components/atoms/Price';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';
import FormField from '@/components/molecules/FormField';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import useCreateOrder from '@/hooks/useCreateOrder';
import { checkoutSchema } from '@/lib/validators';
import { UAE_EMIRATES } from '@/constants/uae';
import { playSound } from '@/lib/sounds';

type CheckoutFormData = z.input<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, count, clearCart } = useCart();
  const { user } = useAuth();
  const createOrderMutation = useCreateOrder();
  const loading = createOrderMutation.isPending;
  const [serverError, setServerError] = useState('');
  const [step, setStep] = useState<'details' | 'review'>('details');
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.name || '',
      phone: '',
      email: user?.email || '',
      emirate: undefined,
      area: '',
      street: '',
      building: '',
      floor: '',
      apartment: '',
      landmark: '',
      instructions: '',
      orderNotes: '',
      paymentMethod: 'cod',
    },
  });

  // Pre-fill fields when user finishes loading
  useEffect(() => {
    if (user) {
      reset({
        fullName: user.name || '',
        email: user.email || '',
        phone: '',
        emirate: undefined,
        area: '',
        street: '',
        building: '',
        floor: '',
        apartment: '',
        landmark: '',
        instructions: '',
        orderNotes: '',
        paymentMethod: 'cod',
      } as any);
    }
  }, [user, reset]);
 
  const onGoToReview = (data: any) => {
    setCheckoutData(data);
    setStep('review');
    setServerError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
 
  const onPlaceOrder = async (data: any) => {
    if (items.length === 0 || !data) return;
 
    setServerError('');
    try {
      const orderItems = items.map((item) => ({
        menuItemId: item.id,
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));
 
      const payload = {
        items: orderItems,
        customer: {
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
        },
        deliveryAddress: {
          emirate: data.emirate,
          area: data.area,
          street: data.street,
          building: data.building,
          floor: data.floor || '',
          apartment: data.apartment || '',
          landmark: data.landmark || '',
          instructions: data.instructions || '',
        },
        orderNotes: data.orderNotes || '',
        paymentMethod: 'cod' as const,
      };
 
      const response = await createOrderMutation.mutateAsync(payload as any);

      if (response.success && response.data) {
        setIsRedirecting(true);
        clearCart(false);
        playSound('success');
        router.push(`/orders/${response.data.id}`);
      } else {
        setServerError(response.message || 'Failed to place order.');
        playSound('error');
      }
    } catch (err: any) {
      playSound('error');
      const backendErrors = err.response?.data?.errors;
      if (backendErrors && typeof backendErrors === 'object') {
        Object.entries(backendErrors).forEach(([key, msg]) => {
          const flatKey = key.replace(/^(customer|deliveryAddress)\./, '');
          setError(flatKey as any, { type: 'server', message: msg as string });
        });
        setServerError('Please fix the validation errors below.');
        setStep('details');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setServerError(
          err.response?.data?.message || err.message || 'An error occurred while placing your order.'
        );
        setStep('details');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  if (isRedirecting || createOrderMutation.isPending || createOrderMutation.isSuccess || items.length === 0) {
    return (
      <ShopLayout>
        <div className="py-28 flex flex-col items-center justify-center gap-3 text-center min-h-[40vh]">
          <Spinner size="lg" />
        </div>
      </ShopLayout>
    );
  }

  return (
    <ProtectedRoute>
      <ShopLayout>
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
          {/* Header */}
          <div className="border-b border-slate-100 pb-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {step === 'details' ? 'Checkout' : 'Confirm Your Order'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {step === 'details' 
                ? 'Please enter your delivery details to complete your order.' 
                : 'Please review all details and confirm your order before submitting.'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center justify-center max-w-sm mx-auto py-2">
            <div className="flex items-center w-full">
              <div className="flex flex-col items-center relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                  step === 'details' 
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/25 ring-4 ring-teal-500/10' 
                    : 'bg-emerald-500 text-white'
                }`}>
                  {step === 'details' ? '1' : '✓'}
                </div>
                <span className="text-[9px] font-bold text-slate-600 mt-1 absolute -bottom-5 whitespace-nowrap">1. Delivery Details</span>
              </div>
              <div className={`flex-grow h-0.5 mx-2 transition-all duration-500 ${
                step === 'review' ? 'bg-emerald-500' : 'bg-slate-200'
              }`} />
              <div className="flex flex-col items-center relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                  step === 'review' 
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/25 ring-4 ring-teal-500/10' 
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  2
                </div>
                <span className="text-[9px] font-bold text-slate-400 mt-1 absolute -bottom-5 whitespace-nowrap">2. Review &amp; Confirm</span>
              </div>
            </div>
          </div>
          <div className="h-4" />

          {serverError && (
            <div className="bg-rose-50 border border-rose-100 text-xs text-rose-600 p-4 rounded-xl font-bold">
              ⚠️ {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(step === 'details' ? onGoToReview : () => onPlaceOrder(checkoutData))} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Form Fields */}
            <div className={`lg:col-span-2 space-y-6 ${step === 'details' ? '' : 'hidden'}`}>
              {/* Customer Info Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-2">
                  1. Customer Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    id="fullName"
                    label="Full Name *"
                    register={register}
                    error={errors.fullName?.message}
                    placeholder="Enter your full name"
                    labelClassName="text-sm sm:text-base font-bold text-slate-700 mb-1"
                    className="text-base py-3"
                  />
                  <FormField
                    id="phone"
                    label="Mobile Number (UAE) *"
                    register={register}
                    error={errors.phone?.message}
                    placeholder="e.g. 050 123 4567"
                    labelClassName="text-sm sm:text-base font-bold text-slate-700 mb-1"
                    className="text-base py-3"
                  />
                  <div className="md:col-span-2">
                    <FormField
                      id="email"
                      label="Email Address *"
                      type="email"
                      register={register}
                      error={errors.email?.message}
                      placeholder="e.g. name@example.com"
                      labelClassName="text-sm sm:text-base font-bold text-slate-700 mb-1"
                      className="text-base py-3"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-2">
                  2. UAE Delivery Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 w-full">
                    <label htmlFor="emirate" className="text-sm sm:text-base font-bold text-slate-700 tracking-wide mb-1">
                      Emirate *
                    </label>
                    <select
                      id="emirate"
                      className={`w-full px-3 py-3 text-base bg-white border rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-150 ${
                        errors.emirate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300'
                      }`}
                      {...register('emirate')}
                    >
                      <option value="">Select Emirate</option>
                      {UAE_EMIRATES.map((e) => (
                        <option key={e} value={e}>
                          {e}
                        </option>
                      ))}
                    </select>
                    {errors.emirate && (
                      <span className="text-sm text-red-500 font-medium mt-0.5">
                        {errors.emirate.message}
                      </span>
                    )}
                  </div>

                  <FormField
                    id="area"
                    label="Area / Community *"
                    register={register}
                    error={errors.area?.message}
                    placeholder="e.g. Dubai Marina, Jumeirah"
                    labelClassName="text-sm sm:text-base font-bold text-slate-700 mb-1"
                    className="text-base py-3"
                  />

                  <FormField
                    id="street"
                    label="Street *"
                    register={register}
                    error={errors.street?.message}
                    placeholder="e.g. Al Wasl Road, 12th Street"
                    labelClassName="text-sm sm:text-base font-bold text-slate-700 mb-1"
                    className="text-base py-3"
                  />

                  <FormField
                    id="building"
                    label="Building / Villa Name or Number *"
                    register={register}
                    error={errors.building?.message}
                    placeholder="e.g. Marina Heights, Villa 15"
                    labelClassName="text-sm sm:text-base font-bold text-slate-700 mb-1"
                    className="text-base py-3"
                  />

                  <FormField
                    id="floor"
                    label="Floor (Optional)"
                    register={register}
                    error={errors.floor?.message}
                    placeholder="e.g. 14th Floor"
                    labelClassName="text-sm sm:text-base font-bold text-slate-700 mb-1"
                    className="text-base py-3"
                  />

                  <FormField
                    id="apartment"
                    label="Apartment / Suite / Unit (Optional)"
                    register={register}
                    error={errors.apartment?.message}
                    placeholder="e.g. Apt 1402"
                    labelClassName="text-sm sm:text-base font-bold text-slate-700 mb-1"
                    className="text-base py-3"
                  />

                  <div className="md:col-span-2">
                    <FormField
                      id="landmark"
                      label="Landmark (Optional)"
                      register={register}
                      error={errors.landmark?.message}
                      placeholder="e.g. Near Marina Mall, opposite Metro station"
                      labelClassName="text-sm sm:text-base font-bold text-slate-700 mb-1"
                      className="text-base py-3"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FormField
                      id="instructions"
                      label="Delivery Instructions (Optional)"
                      type="textarea"
                      register={register}
                      error={errors.instructions?.message}
                      placeholder="e.g. Leave package with reception, ring bell, call before arriving"
                      rows={2}
                      labelClassName="text-sm sm:text-base font-bold text-slate-700 mb-1"
                      className="text-base py-3"
                    />
                  </div>
                </div>
              </div>

              {/* Order Notes Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-2">
                  3. Order Notes
                </h2>
                <FormField
                  id="orderNotes"
                  label="Special Notes (Optional)"
                  type="textarea"
                  register={register}
                  error={errors.orderNotes?.message}
                  placeholder="e.g. Please deliver after 6 PM, keep away from pets"
                  rows={2}
                  labelClassName="text-sm sm:text-base font-bold text-slate-700 mb-1"
                  className="text-base py-3"
                />
              </div>

              {/* Payment Method Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-2">
                  4. Payment Method
                </h2>
                <div className="p-4 border border-teal-500 bg-teal-50/10 rounded-xl flex items-start gap-3">
                  <input
                    type="radio"
                    value="cod"
                    checked
                    readOnly
                    className="mt-1 text-teal-600 focus:ring-teal-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800">Cash on Delivery (COD)</p>
                    <p className="text-xs text-slate-400 mt-0.5">Pay in cash when your order is delivered to your doorstep.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Screen Content */}
            {step === 'review' && checkoutData && (
              <div className="lg:col-span-2 space-y-6 animate-fade-in">
                <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 flex gap-3 text-sm sm:text-base text-teal-800 font-medium">
                  <span className="text-sm">💡</span>
                  <p>
                    Please review your delivery details and items below. If everything looks correct, click <strong>Confirm &amp; Place Order</strong> to submit your order.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wider">
                      1. Customer Information
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('details');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm sm:text-base">
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Full Name</span>
                      <span className="font-bold text-slate-800">{checkoutData.fullName}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Mobile Number</span>
                      <span className="font-mono font-bold text-slate-800">{checkoutData.phone}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Email Address</span>
                      <span className="font-bold text-slate-800">{checkoutData.email}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wider">
                      2. Delivery Address (UAE)
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('details');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm sm:text-base">
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Emirate</span>
                      <span className="font-bold text-slate-800">{checkoutData.emirate}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Area / Community</span>
                      <span className="font-bold text-slate-800">{checkoutData.area}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Street Name</span>
                      <span className="font-bold text-slate-800">{checkoutData.street}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Building / Villa Name or Number</span>
                      <span className="font-bold text-slate-800">{checkoutData.building}</span>
                    </div>
                    {checkoutData.floor && (
                      <div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Floor</span>
                        <span className="font-bold text-slate-800">{checkoutData.floor}</span>
                      </div>
                    )}
                    {checkoutData.apartment && (
                      <div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Apartment / Suite</span>
                        <span className="font-bold text-slate-800">{checkoutData.apartment}</span>
                      </div>
                    )}
                    {checkoutData.landmark && (
                      <div className="md:col-span-2">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Landmark</span>
                        <span className="font-bold text-slate-800">{checkoutData.landmark}</span>
                      </div>
                    )}
                    {checkoutData.instructions && (
                      <div className="md:col-span-2">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Delivery Instructions</span>
                        <p className="text-slate-600 leading-relaxed italic bg-slate-50 rounded-xl p-3 border border-slate-100 font-semibold">{checkoutData.instructions}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-50 pb-2">
                    3. Payment &amp; Special Notes
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm sm:text-base">
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Payment Method</span>
                      <div className="p-3 border border-teal-500 bg-teal-50/10 rounded-xl flex items-center gap-2 mt-1">
                        <span className="text-emerald-600">💵</span>
                        <div>
                          <p className="font-bold text-slate-800">Cash on Delivery (COD)</p>
                          <p className="text-xs text-slate-400 mt-0.5">Pay in cash upon delivery.</p>
                        </div>
                      </div>
                    </div>
                    {checkoutData.orderNotes && (
                      <div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Special Notes</span>
                        <p className="text-slate-600 leading-relaxed italic bg-slate-50 rounded-xl p-3 border border-slate-100 font-semibold mt-1">{checkoutData.orderNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sidebar Summary */}
            <div className="space-y-6 lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-50">
                  Order Summary
                </h2>

                <div className="divide-y divide-slate-100 max-h-[250px] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between py-2.5 gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          Qty: {item.quantity} × {new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(item.price)}
                        </p>
                      </div>
                      <Price amount={item.price * item.quantity} className="text-xs text-teal-600 font-extrabold flex-shrink-0" />
                    </div>
                  ))}
                </div>

                <hr className="border-slate-100" />

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Subtotal ({count} items)</span>
                    <Price amount={total} className="font-bold text-slate-800" />
                  </div>
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Shipping</span>
                    <span className="font-bold text-emerald-600 uppercase tracking-wide text-[10px]">FREE</span>
                  </div>
                  <hr className="border-slate-100 my-1" />
                  <div className="flex justify-between items-center text-sm font-extrabold pt-1">
                    <span className="text-slate-900">Total</span>
                    <Price amount={total} className="text-teal-600 text-base" />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={loading}
                    className="w-full py-3.5 font-extrabold shadow-lg shadow-teal-500/15 text-xs uppercase tracking-wider"
                  >
                    {step === 'details' ? 'Review Order & Details →' : 'Confirm & Place Order 🎉'}
                  </Button>
                  {step === 'review' ? (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setStep('details');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full py-3 font-bold text-xs"
                    >
                      ← Edit Details
                    </Button>
                  ) : (
                    <Link href="/cart" className="w-full block">
                      <Button variant="outline" className="w-full py-3 font-bold text-xs">
                        ← Back to Cart
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </ShopLayout>
    </ProtectedRoute>
  );
}
