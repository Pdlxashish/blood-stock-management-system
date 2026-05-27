'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DonationCountdownProps {
  lastDonationDate?: string;
  donorId: string;
}

export default function DonationCountdown({ lastDonationDate, donorId }: DonationCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEligible: boolean;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    if (!lastDonationDate) {
      setTimeRemaining({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isEligible: true,
        percentage: 100,
      });
      return;
    }

    const calculateTimeRemaining = () => {
      const lastDonation = new Date(lastDonationDate);
      const nextEligibleDate = new Date(lastDonation.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 days
      const now = new Date();
      const diff = nextEligibleDate.getTime() - now.getTime();

      if (diff <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isEligible: true,
          percentage: 100,
        };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Calculate percentage (90 days = 100%)
      const totalDays = 90;
      const daysPassed = totalDays - days;
      const percentage = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

      return {
        days,
        hours,
        minutes,
        seconds,
        isEligible: false,
        percentage,
      };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [lastDonationDate]);

  if (!timeRemaining) {
    return null;
  }

  const getStatusColor = () => {
    if (timeRemaining.isEligible) return 'from-green-500 to-green-600';
    if (timeRemaining.days <= 7) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getProgressColor = () => {
    if (timeRemaining.percentage >= 90) return 'bg-green-500';
    if (timeRemaining.percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="overflow-hidden border-2 shadow-lg">
      <div className={`bg-gradient-to-r ${getStatusColor()} p-4 text-white`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <h3 className="font-bold text-lg">Donation Eligibility</h3>
          </div>
          {timeRemaining.isEligible ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <AlertCircle className="w-6 h-6" />
          )}
        </div>
        <p className="text-sm opacity-90">
          {timeRemaining.isEligible 
            ? 'You are eligible to donate!' 
            : 'Time until next donation'}
        </p>
      </div>
      
      <CardContent className="p-4">
        {timeRemaining.isEligible ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-green-600 mb-2">Ready to Donate!</h4>
            <p className="text-sm text-gray-600">
              You can schedule your next blood donation
            </p>
            {lastDonationDate && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500">Last donation</p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date(lastDonationDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Countdown Display */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">{timeRemaining.days}</div>
                  <div className="text-xs text-gray-600 mt-1">Days</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">{timeRemaining.hours}</div>
                  <div className="text-xs text-gray-600 mt-1">Hours</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">{timeRemaining.minutes}</div>
                  <div className="text-xs text-gray-600 mt-1">Mins</div>
                </div>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="text-2xl font-bold text-gray-900">{timeRemaining.seconds}</div>
                  <div className="text-xs text-gray-600 mt-1">Secs</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-gray-900">{Math.round(timeRemaining.percentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${getProgressColor()} transition-all duration-500 rounded-full`}
                  style={{ width: `${timeRemaining.percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                {timeRemaining.days} days remaining until eligible
              </p>
            </div>

            {/* Last Donation Info */}
            {lastDonationDate && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Last donation:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(lastDonationDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Donor ID */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Donor ID</span>
            <Badge variant="outline" className="font-mono text-xs">
              {donorId.slice(0, 8)}...
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
