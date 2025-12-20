/**
 * Solution Steps Editor with Drag-and-Drop
 */

'use client';

import React from 'react';
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
}

function SortableStepItem({ step, index, onUpdate, onRemove }: SortableStepItemProps) {
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
        placeholder: 'Enter step content...',
      }),
    ],
    content: step.content,
    onUpdate: ({ editor }) => {
      onUpdate(index, { ...step, content: editor.getHTML() });
    },
  });

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
          <span className="font-medium text-gray-700 dark:text-gray-300">Step {step.stepNumber}</span>
        </div>
        <button
          onClick={() => onRemove(index)}
          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
        >
          Remove
        </button>
      </div>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Description (optional)"
          value={step.description || ''}
          onChange={(e) => onUpdate(index, { ...step, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 min-h-[100px]">
          <EditorContent editor={editor} />
        </div>
        <textarea
          placeholder="Explanation (optional)"
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Solution Steps</h3>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Step
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
            />
          ))}
        </SortableContext>
      </DndContext>

      {steps.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No solution steps added. Click "Add Step" to get started.
        </div>
      )}
    </div>
  );
}
