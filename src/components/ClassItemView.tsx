import type { Class } from '../types/models';

interface ClassItemViewProps {
  classData: Class;
  onClick?: () => void;
}

const gradients = [
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-orange-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-purple-600',
  'from-teal-500 to-cyan-600',
];

function getGradientForClass(classId: string): string {
  const index = classId.charCodeAt(0) % gradients.length;
  return gradients[index];
}

export function ClassItemView({ classData, onClick }: ClassItemViewProps) {
  const firstChar = classData.name.charAt(0).toUpperCase();
  const gradient = getGradientForClass(classData.id);

  return (
    <div
      onClick={onClick}
      className="glass-card-hover flex items-center w-full p-4 cursor-pointer"
    >
      {/* Icon with gradient background */}
      <div
        className={`flex items-center justify-center w-14 h-14 rounded-xl bg-linear-to-br ${gradient} shadow-lg`}
      >
        <span className="text-2xl font-bold text-white">{firstChar}</span>
      </div>

      {/* Class info */}
      <div className="ml-4 flex-1 min-w-0">
        <h3 className="text-lg font-bold text-white truncate">
          {classData.name}
        </h3>
        <p className="text-gray-400 text-sm mt-0.5">
          {classData.teacher_name}
        </p>
      </div>

      {/* Arrow */}
      <svg
        className="w-5 h-5 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}
