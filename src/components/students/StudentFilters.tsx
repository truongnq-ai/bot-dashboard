'use client';

import React from 'react';
import { StudentSearchParams } from '@/types/student';

interface StudentFiltersProps {
  searchParams: StudentSearchParams;
  onFilterChange: (params: Partial<StudentSearchParams>) => void;
}

export default function StudentFilters({ searchParams, onFilterChange }: StudentFiltersProps) {
  // No filters needed - role is always STUDENT
  return null;
}

