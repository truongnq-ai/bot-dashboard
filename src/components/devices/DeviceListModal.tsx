'use client';

import React, { useEffect, useState } from 'react';
import Modal from '@/components/common/Modal';
import { Device } from '@/types/device';
import { getDevicesByUserId } from '@/lib/api/device.service';
import { showError } from '@/lib/utils/toast';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils/formatters';

interface DeviceListModalProps {
  userId: string;
  userName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeviceListModal({
  userId,
  userName,
  isOpen,
  onClose,
}: DeviceListModalProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadDevices();
    }
  }, [isOpen, userId]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const response = await getDevicesByUserId(userId);
      if (response.errorCode === '0000' && response.data) {
        setDevices(response.data);
      } else {
        showError(response.errorDetail || 'Không thể tải danh sách thiết bị');
      }
    } catch (error) {
      showError('Hệ thống không có phản hồi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Danh sách thiết bị">
      {userName && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Người dùng: <span className="font-medium">{userName}</span>
        </div>
      )}
      
      {loading ? (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          Đang tải...
        </div>
      ) : devices.length === 0 ? (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          Không có thiết bị nào
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>Device ID</TableCell>
                <TableCell isHeader>Platform</TableCell>
                <TableCell isHeader>Model</TableCell>
                <TableCell isHeader>OS Version</TableCell>
                <TableCell isHeader>Nguồn</TableCell>
                <TableCell isHeader>Cập nhật lần cuối</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id || device.deviceId}>
                  <TableCell className="font-mono text-xs">
                    {device.deviceId.substring(0, 12)}...
                  </TableCell>
                  <TableCell>{device.platform || '-'}</TableCell>
                  <TableCell>{device.model || '-'}</TableCell>
                  <TableCell>{device.osVersion || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {device.isFromTrial && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          Trial
                        </span>
                      )}
                      {device.isFromLicense && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          License
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {device.updatedAt ? formatDate(device.updatedAt) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Modal>
  );
}

