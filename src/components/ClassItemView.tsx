import type { Class } from '../types/models';

interface ClassItemViewProps {
  classData: Class;
  onClick?: () => void;
}

const colors = [
  'bg-emerald-500',
  'bg-teal-500',
  'bg-blue-500',
  'bg-amber-600',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-gray-500',
  'bg-green-500',
  'bg-indigo-500',
  'bg-mint-500',
];

function getColorForClass(classId: string): string {
  // Use class ID to get a consistent color
  const index = classId.charCodeAt(0) % colors.length;
  return colors[index];
}

export function ClassItemView({ classData, onClick }: ClassItemViewProps) {
  const firstChar = classData.name.charAt(0).toUpperCase();
  const bgColor = getColorForClass(classData.id);

  return (
    <div
      onClick={onClick}
      className="flex items-center w-full p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow cursor-pointer mx-4"
    >
      {/* Icon with first character */}
      <div
        className={`flex items-center justify-center w-15 h-15 rounded-xl ${bgColor}`}
      >
        <span className="text-2xl font-bold text-white">{firstChar}</span>
      </div>

      {/* Class info */}
      <div className="ml-5 flex-1 min-w-0">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
          {classData.name}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {classData.teacher_name}
        </p>
      </div>
    </div>
  );
}
