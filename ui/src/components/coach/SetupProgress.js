"use client";

import { CheckCircleIcon, XCircleIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export default function SetupProgress({
  profileComplete = false,
  accountComplete = false,
  slotComplete = false,
  registrationFeeComplete = false
}) {
  const router = useRouter();
  const allComplete = profileComplete && accountComplete && slotComplete && registrationFeeComplete;
  const progressPercentage = ((profileComplete ? 1 : 0) + (accountComplete ? 1 : 0) + (slotComplete ? 1 : 0) + (registrationFeeComplete ? 1 : 0)) * 25;

  const tasks = [
    {
      id: 'profile',
      title: 'Profile Setup',
      description: 'Complete your professional profile',
      completed: profileComplete,
      link: '/dashboard/coachdashboard/profile',
      icon: profileComplete ? CheckCircleIconSolid : CheckCircleIcon
    },
    {
      id: 'account',
      title: 'Account Setup',
      description: 'Add bank details for payouts',
      completed: accountComplete,
      link: '/dashboard/coachdashboard/account',
      icon: accountComplete ? CheckCircleIconSolid : CheckCircleIcon
    },
    {
      id: 'slot',
      title: 'Slot Setup',
      description: 'Set your hourly rate per session',
      completed: slotComplete,
      link: '/dashboard/coachdashboard/slotsetup',
      icon: slotComplete ? CheckCircleIconSolid : CheckCircleIcon
    },
    {
      id: 'registration-fee',
      title: 'Registration Fees',
      description: 'View or configure platform fees',
      completed: registrationFeeComplete,
      link: '/dashboard/coachdashboard/registration-fee',
      icon: registrationFeeComplete ? CheckCircleIconSolid : CheckCircleIcon
    }
  ];

  return (
    <div className="card mb-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Setup Progress
            </h2>
            <p className="text-gray-600">
              Complete these steps to unlock all features
            </p>
          </div>
          {allComplete && (
            <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
              <CheckCircleIconSolid className="w-6 h-6" />
              <span className="font-semibold">All Complete!</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out rounded-full flex items-center justify-end pr-2"
            style={{ width: `${progressPercentage}%` }}
          >
            {progressPercentage > 10 && (
              <span className="text-xs font-bold text-white">
                {Math.round(progressPercentage)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {tasks.map((task, index) => {
          const Icon = task.icon;

          // Step 1 is always enabled. Other steps are enabled only if the previous step is completed.
          const isEnabled = index === 0 || tasks[index - 1].completed;
          const isClickable = isEnabled && !task.completed;
          const isCompleted = task.completed;

          return (
            <div
              key={task.id}
              onClick={() => isClickable && router.push(task.link)}
              className={`
                  relative p-6 rounded-xl border-2 transition-all duration-300 
                  ${isCompleted
                  ? 'bg-emerald-50 border-emerald-300 hover:border-emerald-400 cursor-default opacity-100 shadow-sm'
                  : !isEnabled
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60 grayscale-[0.5]'
                    : 'bg-white border-indigo-200 hover:border-indigo-400 hover:shadow-lg cursor-pointer'
                }
                `}
            >
              {/* Task Number Badge */}
              <div className={`
                absolute -top-3 -left-3 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-transform
                ${isCompleted
                  ? 'bg-emerald-500 text-white scale-110'
                  : !isEnabled
                    ? 'bg-gray-200 text-gray-400'
                    : 'bg-indigo-600 text-white shadow-md'
                }
              `}>
                {isCompleted ? (
                  <CheckCircleIconSolid className="w-6 h-6" />
                ) : (
                  <span className="text-sm uppercase tracking-tighter">{index + 1}</span>
                )}
              </div>

              {/* Status Icons */}
              <div className="absolute top-3 right-3">
                {isCompleted ? (
                  <CheckCircleIconSolid className="w-5 h-5 text-emerald-500" />
                ) : !isEnabled ? (
                  <LockClosedIcon className="w-5 h-5 text-gray-400" />
                ) : null}
              </div>

              <div className="mt-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg ${isCompleted ? 'bg-emerald-100' : isEnabled ? 'bg-indigo-50' : 'bg-gray-100'}`}>
                    <Icon className={`
                      w-6 h-6
                      ${isCompleted ? 'text-emerald-600' : isEnabled ? 'text-indigo-600' : 'text-gray-400'}
                    `} />
                  </div>
                  <h3 className={`
                    text-base font-bold leading-tight
                    ${isCompleted ? 'text-emerald-900' : isEnabled ? 'text-indigo-900' : 'text-gray-400'}
                  `}>
                    {task.title}
                  </h3>
                </div>
                <p className={`text-xs mb-4 leading-relaxed ${isEnabled ? 'text-gray-600' : 'text-gray-400'}`}>
                  {task.description}
                </p>

                {isCompleted ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
                    <CheckCircleIconSolid className="w-3.5 h-3.5" />
                    Complete
                  </div>
                ) : !isEnabled ? (
                  <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    <LockClosedIcon className="w-3.5 h-3.5" />
                    Locked
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-indigo-600 text-[10px] font-bold uppercase tracking-widest group-hover:gap-2 transition-all">
                    Start Setup
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Message */}
      {
        !allComplete && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <LockClosedIcon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 mb-1">
                  Complete all setup tasks to access Manage Schedule
                </p>
                <p className="text-xs text-amber-700">
                  You need to finish Profile Setup, Account Setup, and Slot Setup before managing your schedule.
                </p>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

// The component already accepts accountComplete prop and uses it correctly
// Parent should pass accountComplete={isVPAValid(profile)} when calling this component

