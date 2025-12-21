/**
 * Solution Steps Editor with Drag-and-Drop
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SolutionStepRequest } from '@/types/exercise';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface SolutionStepsEditorProps {
  steps: SolutionStepRequest[];
  onChange: (steps: SolutionStepRequest[]) => void;
}

interface SortableStepItemProps {
  step: SolutionStepRequest;
  index: number;
  onUpdate: (index: number, step: SolutionStepRequest) => void;
  onRemove: (index: number) => void;
  isMounted: boolean;
}

function SortableStepItem({ step, index, onUpdate, onRemove, isMounted }: SortableStepItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `step-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Nhập nội dung bước...',
      }),
    ],
    content: step.content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onUpdate(index, { ...step, content: editor.getHTML() });
    },
  });

  // Cập nhật editor khi step.content thay đổi từ bên ngoài
  useEffect(() => {
    if (editor && isMounted && step.content !== editor.getHTML()) {
      editor.commands.setContent(step.content || '');
    }
  }, [step.content, editor, isMounted]);

  // Cleanup editor khi component unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  // Chỉ render editor khi đã được khởi tạo và đã mount
  if (!editor || !isMounted) {
    return (
      <div ref={setNodeRef} style={style} className="border rounded-lg p-4 mb-2 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ☰
            </button>
            <span className="font-medium text-gray-700 dark:text-gray-300">Bước {step.stepNumber}</span>
          </div>
          <button
            onClick={() => onRemove(index)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            Xóa
          </button>
        </div>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Mô tả (tùy chọn)"
            value={step.description || ''}
            onChange={(e) => onUpdate(index, { ...step, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 min-h-[100px]">
            {/* Editor will be rendered after mount */}
          </div>
          <textarea
            placeholder="Giải thích (tùy chọn)"
            value={step.explanation || ''}
            onChange={(e) => onUpdate(index, { ...step, explanation: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={2}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg p-4 mb-2 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ☰
          </button>
          <span className="font-medium text-gray-700 dark:text-gray-300">Bước {step.stepNumber}</span>
        </div>
        <button
          onClick={() => onRemove(index)}
          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
        >
          Xóa
        </button>
      </div>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Mô tả (tùy chọn)"
          value={step.description || ''}
          onChange={(e) => onUpdate(index, { ...step, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 min-h-[100px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <EditorContent editor={editor} />
        </div>
        <textarea
          placeholder="Giải thích (tùy chọn)"
          value={step.explanation || ''}
          onChange={(e) => onUpdate(index, { ...step, explanation: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          rows={2}
        />
      </div>
    </div>
  );
}

export default function SolutionStepsEditor({ steps, onChange }: SolutionStepsEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = steps.findIndex((_, i) => `step-${i}` === active.id);
      const newIndex = steps.findIndex((_, i) => `step-${i}` === over.id);

      const newSteps = arrayMove(steps, oldIndex, newIndex);
      // Update step numbers
      const renumberedSteps = newSteps.map((step, index) => ({
        ...step,
        stepNumber: index + 1,
      }));
      onChange(renumberedSteps);
    }
  };

  const handleAdd = () => {
    const newStep: SolutionStepRequest = {
      stepNumber: steps.length + 1,
      description: '',
      content: '',
      explanation: '',
    };
    onChange([...steps, newStep]);
  };

  const handleUpdate = (index: number, step: SolutionStepRequest) => {
    const newSteps = [...steps];
    newSteps[index] = step;
    onChange(newSteps);
  };

  const handleRemove = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Renumber steps
    const renumberedSteps = newSteps.map((step, i) => ({
      ...step,
      stepNumber: i + 1,
    }));
    onChange(renumberedSteps);
  };

  // Render a non-interactive version during SSR to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Các bước giải</h3>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thêm bước
          </button>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={`step-${index}`} className="border rounded-lg p-4 mb-2 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="cursor-grab text-gray-500 dark:text-gray-400">
                    ☰
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Bước {step.stepNumber}</span>
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Xóa
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Mô tả (tùy chọn)"
                  value={step.description || ''}
                  onChange={(e) => handleUpdate(index, { ...step, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 min-h-[100px]">
                  {/* TipTap editor will be rendered after mount */}
                </div>
                <textarea
                  placeholder="Giải thích (tùy chọn)"
                  value={step.explanation || ''}
                  onChange={(e) => handleUpdate(index, { ...step, explanation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>

        {steps.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Chưa có bước giải nào. Nhấp "Thêm bước" để bắt đầu.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Các bước giải</h3>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thêm bước
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={steps.map((_, i) => `step-${i}`)} strategy={verticalListSortingStrategy}>
          {steps.map((step, index) => (
            <SortableStepItem
              key={`step-${index}`}
              step={step}
              index={index}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
              isMounted={isMounted}
            />
          ))}
        </SortableContext>
      </DndContext>

      {steps.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Chưa có bước giải nào. Nhấp "Thêm bước" để bắt đầu.
        </div>
      )}
    </div>
  );
}
