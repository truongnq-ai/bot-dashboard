'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { UpdateSkillRequest, Skill } from '@/types/skill';
import { updateSkill } from '@/lib/api/skill.service';
import { showError, showSuccess } from '@/lib/utils/toast';
import { useSkills } from '@/lib/hooks/useSkills';
import { getChaptersByGrade } from '@/lib/api/chapter.service';
import { BUTTON_LOADING_CONFIG } from '@/lib/config/ui.config';

interface SkillUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  skill: Skill | null;
}

export default function SkillUpdateModal({ isOpen, onClose, onSuccess, skill }: SkillUpdateModalProps) {
  const [formData, setFormData] = useState<UpdateSkillRequest>({
    code: '',
    grade: undefined,
    chapterId: '',
    name: '',
    description: '',
    prerequisiteIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPrerequisites, setSelectedPrerequisites] = useState<string[]>([]);
  const [loadingDots, setLoadingDots] = useState('.');
  const [chapters, setChapters] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  
  // Memoize searchParams to prevent infinite loop
  const prerequisiteSearchParams = useMemo(() => ({ pageSize: 1000 }), []);
  
  // Fetch all skills for prerequisite selection
  const { data: allSkillsData } = useSkills(prerequisiteSearchParams);

  // Load skill data when modal opens
  useEffect(() => {
    if (skill && isOpen) {
      setFormData({
        code: skill.code,
        grade: skill.grade as 6 | 7,
        chapterId: skill.chapterId,
        name: skill.name,
        description: skill.description || '',
        prerequisiteIds: skill.prerequisiteIds || [],
      });
      setSelectedPrerequisites(skill.prerequisiteIds || []);
    }
  }, [skill, isOpen]);

  // Fetch chapters by grade when grade is selected
  useEffect(() => {
    const fetchChapters = async () => {
      if (formData.grade) {
        setChaptersLoading(true);
        try {
          const response = await getChaptersByGrade(formData.grade);
          if (response.errorCode === '0000' && response.data) {
            setChapters(response.data.map(c => ({ id: c.id, name: c.name, code: c.code })));
          }
        } catch (error) {
          console.error('Failed to fetch chapters:', error);
        } finally {
          setChaptersLoading(false);
        }
      } else {
        setChapters([]);
      }
    };
    fetchChapters();
  }, [formData.grade]);

  // Animation for loading dots
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingDots((prev) => {
          if (prev === '.') return '..';
          if (prev === '..') return '...';
          return '.';
        });
      }, BUTTON_LOADING_CONFIG.DOTS_ANIMATION_INTERVAL);

      return () => clearInterval(interval);
    } else {
      setLoadingDots('.');
    }
  }, [loading]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.code !== undefined && formData.code !== null) {
      if (formData.code.trim().length > 50) {
        newErrors.code = 'Mã kỹ năng không được vượt quá 50 ký tự';
      }
    }

    if (formData.grade !== undefined && formData.grade !== null) {
      if (formData.grade !== 6 && formData.grade !== 7) {
        newErrors.grade = 'Lớp phải là 6 hoặc 7';
      }
    }

    if (formData.name !== undefined && formData.name !== null) {
      if (formData.name.trim().length > 255) {
        newErrors.name = 'Tên kỹ năng không được vượt quá 255 ký tự';
      }
    }

    if (formData.description !== undefined && formData.description !== null) {
      if (formData.description.length > 1000) {
        newErrors.description = 'Mô tả không được vượt quá 1000 ký tự';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!skill) {
      showError('Không tìm thấy kỹ năng để cập nhật');
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const requestData: UpdateSkillRequest = {
        ...formData,
        prerequisiteIds: selectedPrerequisites.length > 0 ? selectedPrerequisites : undefined,
      };
      const response = await updateSkill(skill.id, requestData);
      if (response.errorCode === '0000') {
        showSuccess('Cập nhật kỹ năng thành công');
        onSuccess?.();
        onClose();
        setErrors({});
      } else {
        showError(response.errorDetail || 'Cập nhật kỹ năng thất bại');
      }
    } catch (error) {
      showError('Hệ thống không có phản hồi.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrerequisiteToggle = (skillId: string) => {
    setSelectedPrerequisites((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    );
  };

  // Filter skills with same grade for prerequisite selection
  const availablePrerequisites = (allSkillsData?.content || []).filter(
    (s) => s.grade === formData.grade && s.id !== skill?.id
  );

  if (!skill) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Chỉnh sửa kỹ năng</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mã kỹ năng
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Ví dụ: 6.1.1"
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
            {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lớp
            </label>
            <select
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.grade ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              value={formData.grade || ''}
              onChange={(e) => {
                const grade = e.target.value ? (parseInt(e.target.value) as 6 | 7) : undefined;
                setFormData({ ...formData, grade, chapterId: '' });
                // Reset prerequisites when grade changes
                setSelectedPrerequisites([]);
              }}
            >
              <option value="">Giữ nguyên</option>
              <option value={6}>Lớp 6</option>
              <option value={7}>Lớp 7</option>
            </select>
            {errors.grade && <p className="mt-1 text-sm text-red-500">{errors.grade}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Chương
            </label>
            <select
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.chapterId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              value={formData.chapterId || ''}
              onChange={(e) => setFormData({ ...formData, chapterId: e.target.value || undefined })}
              disabled={!formData.grade || chaptersLoading}
            >
              <option value="">{!formData.grade ? 'Chọn lớp trước' : chaptersLoading ? 'Đang tải...' : 'Giữ nguyên'}</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.code} - {chapter.name}
                </option>
              ))}
            </select>
            {errors.chapterId && <p className="mt-1 text-sm text-red-500">{errors.chapterId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tên kỹ năng
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Ví dụ: Rút gọn phân số"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value || undefined })}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mô tả
            </label>
            <textarea
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Mô tả chi tiết về kỹ năng này (tùy chọn)"
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value || undefined })}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kỹ năng tiên quyết
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700">
              {availablePrerequisites.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                  {formData.grade ? `Chưa có kỹ năng nào trong lớp ${formData.grade}` : 'Chọn lớp để xem kỹ năng tiên quyết'}
                </p>
              ) : (
                availablePrerequisites.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPrerequisites.includes(s.id)}
                      onChange={() => handlePrerequisiteToggle(s.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {s.code} - {s.name}
                    </span>
                  </label>
                ))
              )}
            </div>
            {selectedPrerequisites.length > 0 && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Đã chọn {selectedPrerequisites.length} kỹ năng tiên quyết
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {loading ? `Đang cập nhật${loadingDots}` : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

