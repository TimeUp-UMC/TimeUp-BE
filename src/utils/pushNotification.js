import fetch from 'node-fetch';
import { BusinessLogicError } from '../errors/error.js';

// 푸시 알람 전송 - 기상 알람 + 자동 알람
export async function sendPushWUNotification(expoPushToken, dto) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: '기상 알람',
        body: '알람 해제',
        data: dto
    };
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_ACCESS_TOKEN}`}, // .env에 expo access token 저장(프론트)
        body: JSON.stringify(message),
    });

    if (!response.ok) {
        throw new BusinessLogicError('푸시 알람 전송 실패');
    } else {
        console.log('푸시 알람 전송 성공:', response);
    }
};

// 내 알람
export async function sendPushMYNotification(expoPushToken, dto) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title:  dto.title,
        body: '알람 해제',
        data: dto
    };
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_ACCESS_TOKEN}`},
        body: JSON.stringify(message),
    });

    if (!response.ok) {
        throw new BusinessLogicError('푸시 알람 전송 실패');
    } else {
        console.log('푸시 알람 전송 성공:', response);
    }
};

// 일정 알람
export async function sendPushSCNotification(expoPushToken, dto) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title:  dto.title,
        body: '확인',
        data: dto
    };
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_ACCESS_TOKEN}`},
        body: JSON.stringify(message),
    });

    if (!response.ok) {
        throw new BusinessLogicError('푸시 알람 전송 실패');
    } else {
        console.log('푸시 알람 전송 성공:', response);
    }
};