import type { YearMonth } from './types';
import { addMonths, compareYearMonth } from './timeline';

export interface CancellationOpportunity {
  noticeMonths: number;
  lockedMonths: YearMonth[];
  earliestFreeMonth: YearMonth;
  monthlySavingsMinor: number;
}

export interface CancellationReminderPlan {
  reminderMonth: YearMonth;
  status: 'active';
}

export function calculateCancellationOpportunity(
  expense: { amountMinorUnits?: number; amountMinor?: number; cancellationNoticeMonths?: number },
  currentMonth: YearMonth
): CancellationOpportunity {
  const noticeMonths = Math.max(0, Math.floor(expense.cancellationNoticeMonths ?? 0));
  const earliestFreeMonth = addMonths(currentMonth, noticeMonths + 1);
  const lockedMonths: YearMonth[] = [];

  for (let index = 0; index <= noticeMonths; index += 1) {
    lockedMonths.push(addMonths(currentMonth, index));
  }

  return {
    noticeMonths,
    lockedMonths,
    earliestFreeMonth,
    monthlySavingsMinor: expense.amountMinorUnits ?? expense.amountMinor ?? 0
  };
}

export function isMonthLockedForCancellation(
  month: YearMonth,
  opportunity: Pick<CancellationOpportunity, 'earliestFreeMonth'>
) {
  return compareYearMonth(month, opportunity.earliestFreeMonth) < 0;
}

export function planCancellationReminder(
  opportunity: Pick<CancellationOpportunity, 'lockedMonths'>
): CancellationReminderPlan {
  return {
    reminderMonth: opportunity.lockedMonths[opportunity.lockedMonths.length - 1],
    status: 'active'
  };
}
