'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { Skill, SkillPrerequisiteDetail, AddSkillPrerequisiteRequest } from '@/types/skill';
import { getSkillPrerequisites, addSkillPrerequisite, removeSkillPrerequisite, getAvailablePrerequisitesForSkill } from '@/lib/api/skill.service';
import { showError, showSuccess } from '@/lib/utils/toast';
import ConfirmModal from '@/components/common/ConfirmModal';

interface SkillPrerequisitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: Skill | null;
}

export default function SkillPrerequisitesModal({ isOpen, onClose, skill }: SkillPrerequisitesModalProps) {
  const [prerequisites, setPrerequisites] = useState<SkillPrerequisiteDetail[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    prerequisite: SkillPrerequisiteDetail | null;
  }>({
    isOpen: false,
    prerequisite: null,
  });

  // Form state for adding prerequisite
  const [formData, setFormData] = useState<AddSkillPrerequisiteRequest>({
    prerequisiteSkillId: '',
  });

  // Fetch prerequisites
  useEffect(() => {
    if (isOpen && skill) {
      fetchPrerequisites();
      fetchAllSkills();
    }
  }, [isOpen, skill]);

  const fetchPrerequisites = async () => {
    if (!skill) return;

    setLoading(true);
    try {
      const response = await getSkillPrerequisites(skill.id);
      if (response.errorCode === '0000' && response.data) {
        setPrerequisites(response.data);
      } else {
        showError(response.errorDetail || 'Không thể tải danh sách kỹ năng tiên quyết');
      }
    } catch (error) {
      console.error('Failed to fetch prerequisites:', error);
      showError('Không thể tải danh sách kỹ năng tiên quyết');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSkills = async () => {
    if (!skill) return;

    try {
      // Fetch available prerequisites (skills in same chapter, not already prerequisites, exclude self)
      const response = await getAvailablePrerequisitesForSkill(skill.id);
      if (response.errorCode === '0000' && response.data) {
        setAllSkills(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch available prerequisites:', error);
    }
  };

  // Backend already filters, so availableSkills is just allSkills
  const availableSkills = useMemo(() => {
    return allSkills;
  }, [allSkills]);

  const handleAddPrerequisite = async () => {
    if (!skill || !formData.prerequisiteSkillId) {
      showError('Vui lòng chọn kỹ năng tiên quyết');
      return;
    }

    setAdding(true);
    try {
      const response = await addSkillPrerequisite(skill.id, formData);
      if (response.errorCode === '0000') {
        showSuccess('Thêm kỹ năng tiên quyết thành công');
        setFormData({ prerequisiteSkillId: '' });
        await fetchPrerequisites();
        await fetchAllSkills(); // Refresh available skills
      } else {
        showError(response.errorDetail || 'Không thể thêm kỹ năng tiên quyết');
      }
    } catch (error) {
      console.error('Failed to add prerequisite:', error);
      showError('Không thể thêm kỹ năng tiên quyết');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteClick = (prerequisite: SkillPrerequisiteDetail) => {
    setConfirmDelete({
      isOpen: true,
      prerequisite,
    });
  };

  const handleConfirmDelete = async () => {
    if (!skill || !confirmDelete.prerequisite) return;

    setDeletingId(confirmDelete.prerequisite.skillId);
    try {
      const response = await removeSkillPrerequisite(skill.id, confirmDelete.prerequisite.skillId);
      if (response.errorCode === '0000') {
        showSuccess('Xóa kỹ năng tiên quyết thành công');
        await fetchPrerequisites();
        await fetchAllSkills(); // Refresh available skills
      } else {
        showError(response.errorDetail || 'Không thể xóa kỹ năng tiên quyết');
      }
    } catch (error) {
      console.error('Failed to remove prerequisite:', error);
      showError('Không thể xóa kỹ năng tiên quyết');
    } finally {
      setDeletingId(null);
      setConfirmDelete({ isOpen: false, prerequisite: null });
    }
  };

  if (!skill) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Kỹ năng tiên quyết - {skill.name}
          </h2>

          {/* Add Prerequisite Section */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thêm kỹ năng tiên quyết</h3>
            
            {availableSkills.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tất cả kỹ năng trong cùng chương đã được thêm làm tiên quyết
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kỹ năng tiên quyết <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.prerequisiteSkillId}
                    onChange={(e) => setFormData({ prerequisiteSkillId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={adding}
                  >
                    <option value="">-- Chọn kỹ năng tiên quyết --</option>
                    {availableSkills.map((availableSkill) => (
                      <option key={availableSkill.id} value={availableSkill.id}>
                        {availableSkill.code} - {availableSkill.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleAddPrerequisite}
                    disabled={adding || !formData.prerequisiteSkillId}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium
                             hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors flex items-center justify-center gap-2 min-w-[120px]"
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
                      'Thêm kỹ năng tiên quyết'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Prerequisites List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Danh sách kỹ năng tiên quyết ({prerequisites.length})
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
            ) : prerequisites.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Chưa có kỹ năng tiên quyết nào
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
                    {prerequisites.map((prerequisite) => (
                      <tr key={prerequisite.skillId} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                          {prerequisite.skillCode}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {prerequisite.skillName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {prerequisite.skillDescription || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => handleDeleteClick(prerequisite)}
                            disabled={deletingId === prerequisite.skillId}
                            className="px-3 py-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300
                                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {deletingId === prerequisite.skillId ? (
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
        onClose={() => setConfirmDelete({ isOpen: false, prerequisite: null })}
        onConfirm={handleConfirmDelete}
        variant="danger"
        title="Xác nhận xóa kỹ năng tiên quyết"
        message={`Bạn có chắc chắn muốn xóa kỹ năng tiên quyết "${confirmDelete.prerequisite?.skillName}"?`}
        confirmText="Xóa"
        cancelText="Hủy"
        isLoading={deletingId !== null}
      />
    </>
  );
}

