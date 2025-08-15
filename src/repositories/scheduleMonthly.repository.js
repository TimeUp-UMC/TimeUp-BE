import { prisma } from '../db.config.js';

// 월 범위와 하루라도 겹치는 비반복 + 모든 반복 로드, 그리고 반복 규칙까지 메모리 조인
export const findSchedulesByMonth = async (userId, year, month) => {
  const monthStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const nextMonthStart = new Date(year, month, 1, 0, 0, 0, 0);

  // 1) 비반복(교집합) + 반복(전부) 로드
  const schedules = await prisma.schedules.findMany({
    where: {
      user_id: userId,
      OR: [
        // 비반복: [start, end) 가 월 범위와 교집합
        {
          AND: [
            { is_recurring: false },
            { start_date: { lt: nextMonthStart } },
            { end_date:   { gt: monthStart } },
          ],
        },
        // 반복: 전부 로드(전개는 서비스에서)
        { is_recurring: true },
      ],
    },
    select: {
      schedule_id: true,
      color: true,
      start_date: true,
      end_date: true,
      is_recurring: true,
    },
  });

  // 2) 반복 규칙 조인
  const recurringIds = schedules.filter(s => s.is_recurring).map(s => s.schedule_id);

  let recMap = new Map();
  if (recurringIds.length > 0) {
    const recs = await prisma.recurrence_rules.findMany({
      where: { schedule_id: { in: recurringIds } },
      select: {
        recurrence_id: true,
        schedule_id: true,
        repeat_type: true,          // 'weekly' | 'monthly'
        repeat_mode: true,          // 'count' | 'until'
        repeat_count: true,
        repeat_until_date: true,
        monthly_repeat_option: true, // 'by_day_of_month' | 'by_nth_weekday'
        day_of_month: true,
        nth_week: true,
        weekday: true,
      },
    });

    const recIds = recs.map(r => r.recurrence_id);
    const weekdays = recIds.length
      ? await prisma.repeat_weekdays.findMany({
          where: { recurrence_id: { in: recIds } },
          select: { recurrence_id: true, day_of_week: true },
        })
      : [];

    const wkMap = new Map();
    for (const w of weekdays) {
      if (!wkMap.has(w.recurrence_id)) wkMap.set(w.recurrence_id, []);
      wkMap.get(w.recurrence_id).push(w.day_of_week);
    }

    for (const r of recs) {
      recMap.set(r.schedule_id, {
        ...r,
        repeat_weekdays: wkMap.get(r.recurrence_id) || [],
      });
    }
  }

  // 3) 서비스 전개용 형태 반환
  return schedules.map(s => ({
    schedule_id: s.schedule_id,
    color: s.color,
    start_date: s.start_date,
    end_date: s.end_date,
    is_recurring: s.is_recurring,
    recurrence_rule: s.is_recurring ? (recMap.get(s.schedule_id) || null) : null,
  }));
};
