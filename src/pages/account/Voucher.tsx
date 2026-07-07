import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateHotelVoucher } from '../../services/hotelApi';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function Voucher() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [voucherData, setVoucherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchVoucher();
    }
  }, [bookingId]);

  const fetchVoucher = async () => {
    try {
      const res = await generateHotelVoucher(bookingId!);
      setVoucherData(res?.GenerateVoucher || res);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate voucher');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Generating voucher...</div>;
  }

  if (!voucherData) {
    return <div className="p-8 text-center">Voucher not available.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Hotel Voucher</h1>
        <Button variant="outline" onClick={() => navigate(`/account/trips/${bookingId}`)}>Back to Booking</Button>
      </div>

      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Booking Voucher</h2>
            <p className="text-slate-500">Please present this voucher at the hotel upon check-in.</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-700">Confirmation No</p>
            <p className="text-lg font-bold text-slate-900">{voucherData.ConfirmationNo}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-semibold text-slate-700 mb-2">Hotel Details</h3>
            <p className="font-bold">{voucherData.HotelName}</p>
            <p className="text-sm text-slate-600 mt-1">{voucherData.HotelAddress}</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-700 mb-2">Guest Details</h3>
            <p className="font-bold">{voucherData.GuestName}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 bg-slate-50 p-4 rounded-lg mb-8">
          <div>
            <p className="text-sm text-slate-500">Check-In</p>
            <p className="font-bold">{voucherData.CheckInDate}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Check-Out</p>
            <p className="font-bold">{voucherData.CheckOutDate}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Rooms</p>
            <p className="font-bold">{voucherData.NoOfRooms}</p>
          </div>
        </div>
        
        {voucherData.CancellationPolicy && (
          <div>
            <h3 className="font-semibold text-slate-700 mb-2">Cancellation Policy</h3>
            <p className="text-sm text-slate-600 bg-red-50 p-3 rounded text-red-800 border border-red-100">
              {voucherData.CancellationPolicy}
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-center">
        <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          Print Voucher
        </Button>
      </div>
    </div>
  );
}
