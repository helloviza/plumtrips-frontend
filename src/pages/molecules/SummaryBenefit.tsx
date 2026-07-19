import React from 'react';
import { Icon } from '../atoms/Icon';
import { icons } from 'lucide-react';

interface SummaryBenefitProps {
  icon: keyof typeof icons;
  title: string;
  description: string;
}

export function SummaryBenefit({ icon, title, description }: SummaryBenefitProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
        <Icon name={icon} size={16} className="text-green-600" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-slate-900">{title}</span>
        <span className="text-xs text-slate-500">{description}</span>
      </div>
    </div>
  );
}
