import dotenv from 'dotenv';
dotenv.config();

import {
  updateAutoAlarmInDB,
  getscheduleInDB,
  getAutoAlarmInDB,
  findAutoDataById,
  createAutoAlarmInDB,
} from '../repositories/autoalarm.repository.js';
import { prisma } from '../db.config.js';

import axios from 'axios';
const KAKAO_API_KEY = process.env.KAKAO_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// 자동 알람 수정 + 비활성화
export const updatedAutoAlarmService = async (ATalarmId, dto) => {
  return await updateAutoAlarmInDB(ATalarmId, dto);
};

// 자동 알람 조회
export const getAutoAlarmByUserId = async (userId) => {
  const schedules = await getscheduleInDB(userId);
  const scheduleIds = schedules.map((s) => s.schedule_id);

  return await getAutoAlarmInDB(scheduleIds);
};

// ISO 문자열 -> Unix timestamp (초)
function toUnixTimestamp(dateTimeStr) {
  // '202508092155' → '2025-08-09T21:55:00' ISO 형태로 변환 후 UNIX timestamp 반환
  const year = dateTimeStr.slice(0, 4);
  const month = dateTimeStr.slice(4, 6);
  const day = dateTimeStr.slice(6, 8);
  const hour = dateTimeStr.slice(8, 10);
  const minute = dateTimeStr.slice(10, 12);

  const isoString = `${year}-${month}-${day}T${hour}:${minute}`; // UTC 기준
  const date = new Date(isoString);
  return Math.floor(date.getTime() / 1000); // 초 단위 UNIX timestamp 반환
}

// Unix timestamp (초) -> "HH:mm" 문자열
function toTimeStringFromUnix(unixTime) {
  const date = new Date(unixTime * 1000);
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

// 초 -> "XX분 YY초" 포맷 문자열 반환
function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec > 0 ? `${min}분 ${sec}초` : `${min}분`;
}

// 두 위경도 사이 직선거리 계산 (m)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // 지구 반경(m)
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 🚗 자동차
export async function getDrivingRoute(origin, destination, departure_time) {
  const url = `https://apis-navi.kakaomobility.com/v1/future/directions?origin=${origin}&destination=${destination}&departure_time=${departure_time}`;
  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
  });

  if (!res.ok) throw new Error(`자동차 경로 요청 실패: ${await res.text()}`);
  const data = await res.json();

  let durationText = '이동 시간 정보 없음';
  let arrivalTime = null;

  if (data.routes?.length > 0) {
    const duration = data.routes[0].summary?.duration;
    if (duration && !isNaN(duration)) {
      durationText = formatDuration(duration);
      const depUnix = toUnixTimestamp(departure_time);
      arrivalTime = toTimeStringFromUnix(depUnix + duration);
    }
  }

  return {
    formatted_duration: durationText,
    arrival_time: arrivalTime,
  };
}

// 🚉 대중교통
export async function getTransitRoute(
  origin,
  destination,
  departure_time,
  travel_mode
) {
  const timestamp = toUnixTimestamp(departure_time);
  const [x1, y1] = origin.split(',');
  const [x2, y2] = destination.split(',');
  const googleOrigin = `${y1},${x1}`;
  const googleDestination = `${y2},${x2}`;

  const params = new URLSearchParams({
    origin: googleOrigin,
    destination: googleDestination,
    departure_time: timestamp.toString(),
    key: GOOGLE_API_KEY,
    mode: 'transit',
    transit_mode: travel_mode,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?${params}`
  );
  const data = await res.json();

  if (data.status !== 'OK' || !data.routes?.length) {
    throw new Error(
      `대중교통 경로 실패: ${data.status} - ${data.error_message}`
    );
  }

  const leg = data.routes[0].legs[0];
  const durationValue = leg.duration?.value;
  const formatted = durationValue
    ? formatDuration(durationValue)
    : '이동 시간 정보 없음';

  return {
    formatted_duration: formatted,
    departure_time: leg.departure_time?.text,
    arrival_time: leg.arrival_time?.text,
  };
}

// 🚶 도보
export function getWalkingRoute(origin, destination, departure_time) {
  const [x1, y1] = origin.split(',').map(Number);
  const [x2, y2] = destination.split(',').map(Number);

  const distance = haversineDistance(y1, x1, y2, x2);
  const averageSpeed = 1.33; // m/s
  const duration = Math.round(distance / averageSpeed);
  const depUnix = toUnixTimestamp(departure_time);
  const arrivalTime = toTimeStringFromUnix(depUnix + duration);

  return {
    formatted_duration: formatDuration(duration),
    arrival_time: arrivalTime,
  };
}

// ⏰ 기상 시간 추천
export function calculateWakeupTime({
  travelDurationSec,
  avg_ready_time,
  feedbackScore,
  scheduleStartTime,
}) {
  const readySec = avg_ready_time * 60; // 소수 피드백 점수 반영: 1~5 → -10분 ~ +10분 (선형)
  const feedbackOffsetMin = (3 - feedbackScore) * 5;
  const feedbackOffsetSec = feedbackOffsetMin * 60;

  const totalTimeSec = travelDurationSec + readySec + feedbackOffsetSec;

  const targetTime =
    new Date(scheduleStartTime).getTime() - totalTimeSec * 1000;

  const wakeupTime = new Date(targetTime).toISOString();

  return {
    wakeup_time: wakeupTime,
  };
}

async function addressToCoords(placeName) {
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
    placeName
  )}&inputtype=textquery&fields=geometry&key=${GOOGLE_API_KEY}`;

  const res = await axios.get(url);
  const candidate = res.data.candidates[0];

  if (!candidate) throw new Error('장소를 찾을 수 없습니다.');
  return {
    lat: candidate.geometry.location.lat,
    lng: candidate.geometry.location.lng,
  };
}

//주소 위도/경도 변환
async function addressToCoords_(address) {
  const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
    address
  )}`;
  const res = await axios.get(url, {
    headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
  });
  const doc = res.data.documents[0];
  if (!doc) throw new Error('주소로 좌표를 찾을 수 없습니다.');
  return { lat: doc.y, lng: doc.x };
}

// 시간 문자열 'X시간 Y분 Z초' → 초 단위 변환 함수
function parseDurationToSeconds(str) {
  if (!str) return 0;
  const hourMatch = str.match(/(\d+)시간/);
  const minMatch = str.match(/(\d+)분/);
  const secMatch = str.match(/(\d+)초/);

  const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
  const secs = secMatch ? parseInt(secMatch[1], 10) : 0;

  return hours * 3600 + mins * 60 + secs;
}

// 'yyyyMMddHHmm' 형식으로 변환
function formatDateTime(date) {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');

  return `${yyyy}${mm}${dd}${hh}${min}`;
}

// 자동 알람 등록
export const addAutoAlarmService = async (dto) => {
  const { userId } = dto;

  const autoData = await findAutoDataById(userId);
  if (!autoData) throw new Error('자동 알람 데이터를 찾을 수 없습니다.');

  const {
    avg_ready_time,
    home_address,
    schedule,
    preferredTransport,
    feedback,
  } = autoData;

  if (!schedule || schedule.length === 0) {
    console.info(`userId ${userId}는 내일 스케줄이 없습니다.`);
    return; // 자동 알람 생성하지 않음
  }
  const scheduleStartDate = new Date(schedule.start_date);
  console.log('home_address : ', home_address);
  const origin = await addressToCoords(home_address);
  console.log('origin : ', origin);
  console.log('schedule.address : ', schedule.address);
  const destination = await addressToCoords(schedule.address);
  console.log('destination : ', destination);
  const feedbackScore = feedback;

  let finalResult = null;
  let departureDate, arrivalDate, durationSec, routeData;

  for (let i = 0; i < preferredTransport.length; i++) {
    const mode = preferredTransport[i];
    const result = await getAccurateDepartureTime(
      `${origin.lng},${origin.lat}`,
      `${destination.lng},${destination.lat}`,
      scheduleStartDate,
      mode,
      avg_ready_time
    );

    // 도보이고, 소요시간이 30분 이상이면 다음 수단으로
    if (mode === 'walk' && result.durationSec >= 30 * 60) {
      console.info(
        `🚶 도보 ${Math.floor(result.durationSec / 60)}분 → 다음 모드`
      );
      continue;
    }

    ({ departureDate, arrivalDate, durationSec, routeData } = result);
    break; // 유효한 결과면 루프 종료
  }
  /*
  const { departureDate, arrivalDate, durationSec, routeData } =
    await getAccurateDepartureTime(
      `${origin.lng},${origin.lat}`,
      `${destination.lng},${destination.lat}`,
      scheduleStartDate,
      preferredTransport,
      avg_ready_time
    );
*/
  const wakeupTime = await getRecommendedWakeupTime(
    durationSec,
    avg_ready_time,
    feedback,
    scheduleStartDate
  );

  const now = new Date();
  const createdAtKST = new Date(now.getTime() + 9 * 60 * 60 * 1000); // 9시간 더하기

  const alarmDTO = {
    schedule_id: schedule.schedule_id,
    wakeup_time: wakeupTime,
    sound_id: 1,
    created_at: createdAtKST,
  };

  const newAutoAlarm = await createAutoAlarmInDB(alarmDTO);

  return newAutoAlarm;
};

// 출발시간 계산 함수-반복 (일정 시작 시간에 최대한 맞춤)
async function getAccurateDepartureTime(
  origin,
  destination,
  scheduleStartDate,
  travelMode,
  avg_ready_time,
  maxLoops = 10
) {
  const MIN_DIFF_SEC = 5 * 60; // 최소 여유 5분
  const MAX_DIFF_SEC = 20 * 60; // 최대 여유 20분

  let estimatedDurationSec = 30 * 60; // 초기 예상 이동 시간 30분
  // 초기 출발 시간: 일정 시작 시간 - (준비시간 + 예상 이동시간)
  let departureDate = new Date(
    scheduleStartDate.getTime() -
      (avg_ready_time * 60 + estimatedDurationSec) * 1000
  );

  for (let i = 0; i < maxLoops; i++) {
    const departureTimeStr = formatDateTime(departureDate);

    let routeData;

    if (travelMode === 'car') {
      routeData = await getDrivingRoute(origin, destination, departureTimeStr);
    } else if (travelMode === 'walk') {
      routeData = await getWalkingRoute(origin, destination, departureTimeStr);
    } else {
      // 기본은 transit (지하철/버스)
      routeData = await getTransitRoute(
        origin,
        destination,
        departureTimeStr,
        travelMode
      );
    }

    const durationSec = parseDurationToSeconds(routeData.formatted_duration);
    const arrivalDate = new Date(departureDate.getTime() + durationSec * 1000);
    const diffSec =
      (scheduleStartDate.getTime() - arrivalDate.getTime()) / 1000;

    // console.log(
    //   `반복 ${
    //     i + 1
    //   }: diffSec=${diffSec}, departureDate=${departureDate.toISOString()}`
    // );

    // 도착 시간이 일정 시작 시간보다 늦으면 출발 시간을 앞당긴다
    if (diffSec < 0) {
      departureDate = new Date(departureDate.getTime() + diffSec * 1000); // diffSec 음수 → 출발 시간 당김
    }
    // 도착 시간이 너무 일찍이면 출발 시간을 늦춘다
    else if (diffSec > MAX_DIFF_SEC) {
      departureDate = new Date(
        departureDate.getTime() + (diffSec - MIN_DIFF_SEC) * 1000
      );
    }
    // 적당한 범위 내 도착이면 결과 반환
    else if (diffSec >= MIN_DIFF_SEC && diffSec <= MAX_DIFF_SEC) {
      return { departureDate, arrivalDate, durationSec, routeData };
    }
    // 도착 시간이 조금 빠른 경우, 출발 시간을 약간 앞당긴다
    else if (diffSec >= 0 && diffSec < MIN_DIFF_SEC) {
      departureDate = new Date(
        departureDate.getTime() + (diffSec - MIN_DIFF_SEC) * 1000
      );
    }
  }

  // 반복 종료 후 수렴 실패 시 기본값 반환
  return {
    departureDate,
    arrivalDate: new Date(
      departureDate.getTime() + estimatedDurationSec * 1000
    ),
    durationSec: estimatedDurationSec,
    routeData: null,
  };
}

// "X시간 Y분" 문자열 → 초 단위 변환 (parseDurationToSeconds와 동일)
function parseDurationText(text) {
  return parseDurationToSeconds(text);
}

// 추천 기상 시간 계산
async function getRecommendedWakeupTime(
  travelDurationSec,
  avg_ready_time,
  feedbackScore,
  scheduleStartDate
) {
  const { wakeup_time } = calculateWakeupTime({
    travelDurationSec,
    avg_ready_time,
    feedbackScore,
    scheduleStartTime: scheduleStartDate,
  });

  // 문자열 → Date 객체
  const wakeupDateObj = new Date(wakeup_time);
  // UTC 기준으로 시, 분 추출
  const hours = wakeupDateObj.getUTCHours();
  const minutes = wakeupDateObj.getUTCMinutes();

  // 12시간제 포맷
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHour = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinute = String(minutes).padStart(2, '0');

  const wakeupTimeFormatted = `${formattedHour}:${formattedMinute} ${ampm}`;
  // console.log("기상 시간:", wakeupTimeFormatted);

  return wakeupDateObj;
}
