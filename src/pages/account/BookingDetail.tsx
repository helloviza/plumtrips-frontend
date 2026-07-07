import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingDetail, cancelHotelBooking } from '../../services/hotelApi';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function BookingDetail() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetail();
    }
  }, [bookingId]);

  const fetchBookingDetail = async () => {
    try {
      const res = await getBookingDetail(bookingId!);
      setBooking(res?.BookingDetail || res);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
    setCancelling(true);
    try {
      // 4 = Cancellation request
      await cancelHotelBooking(bookingId!, 4);
      toast.success('Cancellation request sent successfully');
      fetchBookingDetail();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading booking details...</div>;
  }

  if (!booking) {
    return <div className="p-8 text-center">Booking not found.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Booking Details</h1>
        <Button variant="outline" onClick={() => navigate('/account/trips')}>Back to Trips</Button>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Booking ID</p>
            <p className="font-medium">{booking.BookingId}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Confirmation No</p>
            <p className="font-medium">{booking.ConfirmationNo}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Status</p>
            <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
              booking.BookingStatus === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
              booking.BookingStatus === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {booking.BookingStatus || 'Pending'}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Price</p>
            <p className="font-bold text-lg">{formatCurrency(booking.Price?.OfferedPriceRoundedOff || 0)}</p>
          </div>
        </div>
      </div>

      {booking.BookingStatus !== 'Cancelled' && (
        <div className="flex gap-4">
          <Button onClick={() => navigate(`/account/trips/${bookingId}/voucher`)} className="bg-blue-600 hover:bg-blue-700 text-white">
            View / Download Voucher
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={cancelling} className="text-red-600 border-red-200 hover:bg-red-50">
            {cancelling ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </div>
      )}
    </div>
  );
}


