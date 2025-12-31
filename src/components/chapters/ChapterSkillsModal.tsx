'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { Chapter, ChapterSkillDetail, AddChapterSkillRequest } from '@/types/chapter';
import { getChapterSkills, addSkillToChapter, removeSkillFromChapter } from '@/lib/api/chapter.service';
import { getSkills } from '@/lib/api/skill.service';
import { Skill } from '@/types/skill';
import { showError, showSuccess } from '@/lib/utils/toast';
import ConfirmModal from '@/components/common/ConfirmModal';

interface ChapterSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: Chapter | null;
}

export default function ChapterSkillsModal({ isOpen, onClose, chapter }: ChapterSkillsModalProps) {
  const [chapterSkills, setChapterSkills] = useState<ChapterSkillDetail[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    skill: ChapterSkillDetail | null;
  }>({
    isOpen: false,
    skill: null,
  });

  // Form state for adding skill
  const [formData, setFormData] = useState<AddChapterSkillRequest>({
    skillId: '',
    skillType: 'REQUIRED',
  });

  // Fetch chapter skills
  useEffect(() => {
    if (isOpen && chapter) {
      fetchChapterSkills();
      fetchAllSkills();
    }
  }, [isOpen, chapter]);

  const fetchChapterSkills = async () => {
    if (!chapter) return;

    setLoading(true);
    try {
      const response = await getChapterSkills(chapter.id);
      if (response.errorCode === '0000' && response.data) {
        setChapterSkills(response.data);
      } else {
        showError(response.errorDetail || 'Không thể tải danh sách kỹ năng');
      }
    } catch (error) {
      console.error('Failed to fetch chapter skills:', error);
      showError('Không thể tải danh sách kỹ năng');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSkills = async () => {
    if (!chapter) return;

    try {
      // Fetch all skills (no pagination for simplicity, or use large pageSize)
      const response = await getSkills({
        page: 0,
        pageSize: 1000,
        grade: chapter.grade, // Filter by chapter grade
      });
      if (response.errorCode === '0000' && response.data?.content) {
        setAllSkills(response.data.content);
      }
    } catch (error) {
      console.error('Failed to fetch all skills:', error);
    }
  };

  // Filter skills: only show skills that are NOT already in the chapter
  const availableSkills = useMemo(() => {
    const chapterSkillIds = new Set(chapterSkills.map((cs) => cs.skillId));
    return allSkills.filter((skill) => !chapterSkillIds.has(skill.id));
  }, [allSkills, chapterSkills]);

  const handleAddSkill = async () => {
    if (!chapter || !formData.skillId) {
      showError('Vui lòng chọn kỹ năng');
      return;
    }

    setAdding(true);
    try {
      const response = await addSkillToChapter(chapter.id, formData);
      if (response.errorCode === '0000') {
        showSuccess('Thêm kỹ năng vào chương học thành công');
        setFormData({ skillId: '', skillType: 'REQUIRED' });
        await fetchChapterSkills();
        await fetchAllSkills(); // Refresh available skills
      } else {
        showError(response.errorDetail || 'Không thể thêm kỹ năng');
      }
    } catch (error) {
      console.error('Failed to add skill:', error);
      showError('Không thể thêm kỹ năng');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteClick = (skill: ChapterSkillDetail) => {
    setConfirmDelete({
      isOpen: true,
      skill,
    });
  };

  const handleConfirmDelete = async () => {
    if (!chapter || !confirmDelete.skill) return;

    setDeletingId(confirmDelete.skill.skillId);
    try {
      const response = await removeSkillFromChapter(chapter.id, confirmDelete.skill.skillId);
      if (response.errorCode === '0000') {
        showSuccess('Xóa kỹ năng khỏi chương học thành công');
        await fetchChapterSkills();
        await fetchAllSkills(); // Refresh available skills
      } else {
        showError(response.errorDetail || 'Không thể xóa kỹ năng');
      }
    } catch (error) {
      console.error('Failed to remove skill:', error);
      showError('Không thể xóa kỹ năng');
    } finally {
      setDeletingId(null);
      setConfirmDelete({ isOpen: false, skill: null });
    }
  };

  if (!chapter) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Danh sách kỹ năng - {chapter.name}
          </h2>

          {/* Add Skill Section */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thêm kỹ năng</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kỹ năng
                </label>
                <select
                  value={formData.skillId}
                  onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={adding || availableSkills.length === 0}
                >
                  <option value="">-- Chọn kỹ năng --</option>
                  {availableSkills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.code} - {skill.name}
                    </option>
                  ))}
                </select>
                {availableSkills.length === 0 && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Tất cả kỹ năng đã được thêm vào chương
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loại kỹ năng
                </label>
                <select
                  value={formData.skillType}
                  onChange={(e) =>
                    setFormData({ ...formData, skillType: e.target.value as 'REQUIRED' | 'OPTIONAL' })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={adding}
                >
                  <option value="REQUIRED">Bắt buộc</option>
                  <option value="OPTIONAL">Tùy chọn</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleAddSkill}
                  disabled={adding || !formData.skillId || availableSkills.length === 0}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg
                           hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors flex items-center justify-center gap-2"
                >
                  {adding ? (
                    <>
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
                      Đang thêm...
                    </>
                  ) : (
                    'Thêm'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Skills List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Danh sách kỹ năng ({chapterSkills.length})
            </h3>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
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
              </div>
            ) : chapterSkills.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Chưa có kỹ năng nào trong chương này
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tên kỹ năng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Mô tả
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {chapterSkills.map((skill) => (
                      <tr key={skill.skillId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                          {skill.skillCode}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {skill.skillName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {skill.skillDescription || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleDeleteClick(skill)}
                            disabled={deletingId === skill.skillId}
                            className="px-3 py-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300
                                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {deletingId === skill.skillId ? (
                              <span className="flex items-center gap-1">
                                <svg
                                  className="animate-spin h-4 w-4 text-red-600"
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
                                Đang xóa...
                              </span>
                            ) : (
                              'Xóa'
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800
                       transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, skill: null })}
        onConfirm={handleConfirmDelete}
        variant="danger"
        title="Xác nhận xóa kỹ năng"
        message={`Bạn có chắc chắn muốn xóa kỹ năng "${confirmDelete.skill?.skillName}" khỏi chương học này?`}
        confirmText="Xóa"
        cancelText="Hủy"
        isLoading={deletingId !== null}
      />
    </>
  );
}

