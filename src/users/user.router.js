const express = require("express");
const router = express.Router();
const usersController = require("./users.controller");

router.get("/me", usersController.getUserInfo);
router.put("/me", usersController.updateUserInfo);
router.get("/me/auto-alarm-check-time", usersController.getAutoAlarmCheckTime);
router.put("/me/auto-alarm-check-time", usersController.updateAutoAlarmCheckTime);
router.post("/me/auto-alarm-feedback", usersController.submitAutoAlarmFeedback);

// 개인정보 조회
router.get("/me", usersController.getUserInfo);

// 개인정보 수정
router.put("/me", usersController.updateUserInfo);
router.patch("/me", usersController.updateUserInfo); // PATCH도 허용

// 자동 알람 확인 시간 조회
router.get("/me/auto-alarm-check-time", usersController.getAutoAlarmCheckTime);

// 자동 알람 확인 시간 수정
router.put("/me/auto-alarm-check-time", usersController.updateAutoAlarmCheckTime);
router.patch("/me/auto-alarm-check-time", usersController.updateAutoAlarmCheckTime);

// 자동 알람 피드백 제출
router.post("/me/auto-alarm-feedback", usersController.submitAutoAlarmFeedback);

module.exports = router;