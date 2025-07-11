const getUserInfo = (req, res) => {

    if (!req.user) {
        return res.status(405).json({
      message: "유효하지 않은 토큰입니다",
        });
    }
    const user = req.user;

    const userInfo = {
        email: user.email,
        username: user.username,
        birth_year: user.birth_year,
        job: user.job,
        prep_time_minutes: user.prep_time_minutes,
        commute_time_minutes: user.commute_time_minutes,
        auto_alarm_check_time: user.auto_alarm_check_time,
    };

    return res.status(200).json({
        message: "개인 정보 조회 성공",
        data: userInfo,
    });
};


const updateUserInfo = (req, res) => {
  if (!req.user) {
    return res.status(405).json({
      message: "유효하지 않은 토큰입니다",
    });
  }

  const user = req.user;

  // Body에서 수정할 수 있는 항목들
  const {
    username,
    birth_year,
    job,
    prep_time_minutes,
    commute_time_minutes,
    auto_alarm_check_time,
  } = req.body;

  // DB 업데이트는 실제로는 Service Layer에서 처리해야 함.
  // 가상 업데이트 수행
  const updatedUser = {
    ...user,
    ...(username && { username }),
    ...(birth_year && { birth_year }),
    ...(job && { job }),
    ...(prep_time_minutes && { prep_time_minutes }),
    ...(commute_time_minutes && { commute_time_minutes }),
    ...(auto_alarm_check_time && { auto_alarm_check_time }),
  };

  // 실제로는 DB 저장 로직이 들어가야 함!

  return res.status(200).json({
    message: "개인 정보 수정 완료",
    data: updatedUser,
  });
};


const getAutoAlarmCheckTime = (req, res) => {
  if (!req.user) {
    return res.status(405).json({
      message: "유효하지 않은 토큰입니다",
    });
  }

  // 유저 정보에서 알람 시간 추출
  const { auto_alarm_check_time } = req.user;

  return res.status(200).json({
    message: "자동 알람 확인 시간 조회 성공",
    alarm_check_time: auto_alarm_check_time || "22:00",
  });
};


const updateAutoAlarmCheckTime = (req, res) => {
  if (!req.user) {
    return res.status(405).json({
      message: "유효하지 않은 토큰입니다",
    });
  }

  const { alarm_check_time } = req.body;

  return res.status(200).json({
    message: "자동 알람 확인 시간 수정 완료",
  });
};


const submitAutoAlarmFeedback = (req, res) => {
  if (!req.user) {
    return res.status(405).json({
      message: "유효하지 않은 토큰입니다",
    });
  }

  const { time_rating, wakeup_rating, comment } = req.body;

  return res.status(200).json({
    message: "피드백이 성공적으로 저장되었습니다",
  });
};


module.exports = {
  getUserInfo,
  updateUserInfo,
  getAutoAlarmCheckTime,
  updateAutoAlarmCheckTime,
  submitAutoAlarmFeedback,
};
