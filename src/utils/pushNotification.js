import admin from 'firebase-admin';
import { BusinessLogicError } from '../errors/error.js';

// .env에서 service-key 파싱
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_KEY);

// Firebase 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// FCM export
export const fcm = admin.messaging();

// 푸시 알람 전송 - 기상 알람 + 자동 알람
export async function sendPushWUNotification(fcmToken, dto) {
    try {
      const response = await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: "기상 알람",
          body: "알람 해제",
        },
        data: dto.data,
        android: { priority: "high" },
        apns: { payload: { aps: { sound: "default" } } },
      });
      console.log("푸시 알람 전송 성공:", response); // response = messageId
    } catch (error) {
      throw new BusinessLogicError("푸시 알람 전송 실패");
    }
};
  
// 내 알람
export async function sendPushMYNotification(fcmToken, dto) {
    try {
      const response = await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: dto.notification.title,
          body: "알람 해제",
        },
        data: dto.data,
        android: { priority: "high" },
        apns: { payload: { aps: { sound: "default" } } },
      });
      console.log("푸시 알람 전송 성공:", response); // response = messageId
    } catch (error) {
      console.error("푸시 알람 전송 실패:", error);
      throw new BusinessLogicError("푸시 알람 전송 실패");
    }
  };
  

// 일정 알람
export async function sendPushSCNotification(fcmToken, dto) {
    try {
      const response = await admin.messaging().send({
        token: fcmToken,
        notification: {
          title: dto.notification.title,
          body: "확인",
        },
        data: dto.data,
        android: { priority: "high" },
        apns: { payload: { aps: { sound: "default" } } },
      });
      console.log("푸시 알람 전송 성공:", response); // response = messageId
    } catch (error) {
      throw new BusinessLogicError("푸시 알람 전송 실패");
    }
};

// 자동 알람 활성화 여부
export async function sendPushURNotification(token) {
    try {
      const response = await admin.messaging().send({
        token: token,
        notification: {
          title: "자동 알람 활성화",
          body: "자동 알람을 활성화하시겠습니까?",
        },
        android: { priority: "high" },
        apns: { payload: { aps: { sound: "default" } } },
      });
      console.log("푸시 알람 전송 성공:", response); // response = messageId
    } catch (error) {
      throw new BusinessLogicError("푸시 알람 전송 실패");
    }
  };