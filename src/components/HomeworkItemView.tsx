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
} {
  switch (state) {
    case 'notAssigned':
      return {
        label: '未提出',
        bgClass: 'bg-gray-700/50 border border-gray-600',
        textClass: 'text-gray-300',
      };
    case 'generatingQuestions':
      return {
        label: '問題生成中',
        bgClass: 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 border border-purple-500/50',
        textClass: 'text-purple-300',
      };
    case 'questionGenerated':
      return {
        label: '問題生成完了',
        bgClass: 'bg-blue-500/20 border border-blue-500/50',
        textClass: 'text-blue-300',
      };
    case 'completed':
      return {
        label: '提出完了',
        bgClass: 'bg-emerald-500/20 border border-emerald-500/50',
        textClass: 'text-emerald-300',
      };
    case 'failed':
      return {
        label: '生成失敗',
        bgClass: 'bg-red-500/20 border border-red-500/50',
        textClass: 'text-red-300',
      };
    default:
      return {
        label: '不明',
        bgClass: 'bg-gray-700/50 border border-gray-600',
        textClass: 'text-gray-300',
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
      className="glass-card-hover w-full p-5 cursor-pointer"
    >
      <div className="flex items-center">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-lg font-semibold text-white truncate">
            {homework.title}
          </h3>

          {/* Due date */}
          <div className="flex items-center gap-1.5 mt-2 text-gray-400">
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
              className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${stateInfo.bgClass} ${stateInfo.textClass}`}
            >
              {stateInfo.label}
            </span>
          </div>
        </div>

        {/* Right side - Lottie animation for generating state */}
        {homework.submission_state === 'generatingQuestions' && (
          <div className="ml-4 w-16 h-16">
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
            className="ml-4 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            回答
          </button>
        )}

        {/* Arrow for other states */}
        {homework.submission_state !== 'generatingQuestions' && 
         homework.submission_state !== 'questionGenerated' && (
          <svg
            className="ml-4 w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </div>
  );
}
