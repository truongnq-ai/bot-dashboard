'use client';

import React from 'react';
import { ParentSearchParams } from '@/types/parent';

interface ParentFiltersProps {
  searchParams: ParentSearchParams;
  onFilterChange: (params: Partial<ParentSearchParams>) => void;
}

export default function ParentFilters({ searchParams, onFilterChange }: ParentFiltersProps) {
  // No filters needed - role is always PARENT
  return null;
}

