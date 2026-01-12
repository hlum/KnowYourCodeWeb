import Lottie from 'lottie-react';
import type { HomeworkWithStatus, HomeworkState } from '../types/models';
import aiAnimation from '../assets/AI.json';

interface HomeworkItemViewProps {
  homework: HomeworkWithStatus;
  onClick?: () => void;
  onAnswerClick?: () => void;
}

function getStateInfo(state: HomeworkState): {
  label: string;
  bgClass: string;
  textClass: string;
  isGradient?: boolean;
} {
  switch (state) {
    case 'notAssigned':
      return {
        label: '未提出',
        bgClass: 'bg-gray-200',
        textClass: 'text-gray-700',
      };
    case 'generatingQuestions':
      return {
        label: '問題生成中',
        bgClass: 'bg-gradient-to-r from-purple-500 to-blue-400',
        textClass: 'text-white',
        isGradient: true,
      };
    case 'questionGenerated':
      return {
        label: '問題生成完了',
        bgClass: 'bg-blue-100',
        textClass: 'text-blue-700',
      };
    case 'completed':
      return {
        label: '提出完了',
        bgClass: 'bg-green-100',
        textClass: 'text-green-700',
      };
    case 'failed':
      return {
        label: '生成失敗',
        bgClass: 'bg-red-100',
        textClass: 'text-red-700',
      };
    default:
      return {
        label: '不明',
        bgClass: 'bg-gray-200',
        textClass: 'text-gray-700',
      };
  }
}

function formatDueDate(dueDate: string | null | undefined): string {
  if (!dueDate) return '締切未設定';
  return `${dueDate}まで`;
}

export function HomeworkItemView({
  homework,
  onClick,
  onAnswerClick,
}: HomeworkItemViewProps) {
  const stateInfo = getStateInfo(homework.submission_state);

  return (
    <div
      onClick={onClick}
      className="w-full p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-center">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {homework.title}
          </h3>

          {/* Due date */}
          <div className="flex items-center gap-1 mt-2 text-gray-500">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">{formatDueDate(homework.due_date)}</span>
          </div>

          {/* Status badge */}
          <div className="mt-3">
            <span
              className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${stateInfo.bgClass} ${stateInfo.textClass}`}
            >
              {stateInfo.label}
            </span>
          </div>
        </div>

        {/* Right side - Lottie animation for generating state */}
        {homework.submission_state === 'generatingQuestions' && (
          <div className="ml-4 w-20 h-20">
            <Lottie
              animationData={aiAnimation}
              loop={true}
              className="w-full h-full"
            />
          </div>
        )}

        {homework.submission_state === 'questionGenerated' && onAnswerClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAnswerClick();
            }}
            className="ml-4 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-colors"
          >
            回答
          </button>
        )}
      </div>
    </div>
  );
}
