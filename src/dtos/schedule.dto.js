export const bodyToSchedule = (body) => {
  return {
    name: body.name,
    startDate: body.startDate,
    endDate: body.endDate,
    color: body.color,
    placeName: body.placeName,
    address: body.address,
    memo: body.memo || "",
    isImportant: !!body.isImportant,
    isReminding: !!body.isReminding,
    remindAt: body.remindAt,
    isRecurring: !!body.isRecurring,
    repeatRule: body.repeatRule ?? null,
  };
};
