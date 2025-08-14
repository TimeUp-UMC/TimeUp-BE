## 🕖 Backend  
UMC 8th - TimeUp 백엔드 레포지토리입니다.  
  
## 👉🏻 프로젝트 소개  
### [ Service ]  

🔥 불규칙한 일정이 많은 사용자에게 일정을 놓치지 않도록 도와줍니다.  
🔥 일정을 등록하면 자동으로 기상 알람+일정 알람을 설정해 하루를 효율적으로 보낼 수 있습니다.  
🔥 과제나, 약속을 잘 잊는 사람에게 사회적 체면을 지켜주도록 합니다.  


사용자의 일정 및 시간 관리를 보조하는 서비스로, 하루를 알맞게 시작할 수 있도록하는 기상 어시스턴트입니다.  
Time's up! 이라는 표현을 통해 "시간이 다 됐다!"는 느낌을 사용자에게 전달합니다.  
  
## 👩‍💻 팀원 소개  

| [@Mingyeong-Kang](https://github.com/Mingyeong-Kang) | [@meeeji](https://github.com/meeeji) | [@seoyonara](https://github.com/seoyonara) | [@snahpaek](https://github.com/snahpack) |
| --- | --- | --- | --- |
| 강민경 | 김민지 | 박서연 | 백선아 |
| i. 마이페이지 관련 api 개발  <br> -> 개인정보 수정 및 조회  <br> -> 자동 알람 확인 시간 수정 및 조회  <br>  -> 자동 알람 피드백 저장  | i. 알람 관련 api 개발  <br> -> 자동/기상 알람 조회 및 수정  <br> -> 내 알람 등록/조회/수정/삭제  <br>  -> 푸시 알람 전송 | i. 온보딩/로그인 관련 api 개발  <br>  -> 소셜 로그인(구글)  <br>  -> 온보딩(+기상 알람 등록)  <br> ii. 배포 서버 구축 및 api 배포 | i. 일정/캘린더 관련 api 개발  <br>  -> 구글 캘린더 연동  <br>  -> 일정 등록/조회/수정/삭제  |  
 
## 🔧 브랜치 전략  
- `feat -> develop -> main` 순으로 merge  
- `feat` : 각 기능을 개발하는 브랜치  
- `develop` : 각 기능의 개발을 완료하고 테스트 완료 후 병합하는 브랜치  
- `main` : 배포 브랜치  

## 📂 프로젝트 구조  
**1. 폴더 구조**

```
src/
├── app.js                  # Express 앱 설정 및 미들웨어 초기화
├── controllers/            # 요청 처리 로직 (컨트롤러)
│   └── text                # 예시 컨트롤러 파일
├── dtos/                   # 데이터 전송 객체 (DTO)
│   └── text                # 예시 DTO 파일
├── error/                  # 사용자 정의 에러 클래스
│   └── error.js            # 에러 정의 파일
├── middlewares/            # 미들웨어 (공통 기능 처리)
│   └── responseMiddleware.js  # 표준 응답 미들웨어
├── repositories/           # 데이터베이스와의 상호작용 (저장소)
│   └── text                # 예시 저장소 파일
├── router.js               # 라우터 정의 파일  
│   └── text                # 예시 라우터 파일
├── services/               # 비즈니스 로직 (서비스)
│   └── text                # 예시 서비스 파일
└── utils/                  # 유틸리티 함수 (공통 함수)
    └── text                # 예시 유틸리티 파일

```

**각 폴더의 역할**

- **`app.js`**
    
    애플리케이션의 진입점으로, Express 앱을 초기화하고 미들웨어와 라우트를 설정합니다.
    
- **`controllers/`**
    
    요청(Request)을 처리하고 적절한 응답(Response)을 반환하는 로직이 들어갑니다.
    
    예: 사용자 요청을 받아 데이터를 가져오거나 저장하는 역할.
    
- **`dtos/`**
    
    데이터 전송 객체(Data Transfer Object)로, 요청이나 응답 데이터의 구조를 정의합니다.
    
    예: 클라이언트로 보내거나 클라이언트로부터 받은 데이터를 검증 및 정리.
    
- **`error/`**
    
    사용자 정의 에러 클래스가 포함되어 있습니다.
    
    예: `ValidationError`, `NotFoundError` 등.
    
- **`middlewares/`**
    
    요청과 응답 사이에서 실행되는 공통 작업을 처리합니다.
    
    예: 표준 응답 형식을 보장하는 `responseMiddleware.js`.
    
- **`repositories/`**
    
    데이터베이스와의 상호작용을 담당합니다.
    
    예: 데이터를 조회, 삽입, 삭제, 업데이트하는 로직.
    
- **`routes/`**
    
    URL 경로와 컨트롤러를 연결하는 라우터가 포함됩니다.
    
    예: `/users` 경로에 대한 요청을 `UserController`로 전달.  
    
- **`services/`**
    
    비즈니스 로직을 처리합니다.
    
    예: 여러 저장소에서 데이터를 가져와 처리 후 반환.
    
- **`utils/`**
    
    프로젝트 전반에서 재사용할 수 있는 유틸리티 함수가 포함됩니다.
    
    예: 날짜 포맷팅, 문자열 변환 등.
    

---

**2. 표준 응답**

우리 프로젝트에서는 모든 API 응답이 **일관된 JSON 형식**으로 반환됩니다. 이를 통해 클라이언트와 서버 간의 통신을 명확하고 예측 가능하게 유지합니다.

**응답 형식**

**성공 응답**

- **형식**:
    
    ```
    {
    	"result": "Success",
    	"status": 200,
    	"success": { "key": "value" },
    	"error": null
    }
    ```
    
- **설명**:
    - `result`: 요청이 성공했음을 나타냅니다.
    - `status`: HTTP 상태 코드를 나타냅니다.
    - `success`: 요청 처리 결과 데이터를 포함합니다.
    - `error`: 항상 `null`입니다.
- **예시**:
    
    ```
    {
    	"result": "Success",
    	"status": 200,
    	"success": { "message": "User created successfully" },
    	"error": null
    }
    ```
    

**실패 응답**

- **형식**:
    
    ```
    {
    	"result": "Fail",
    	"status": 400,
    	"success": null,
    	"error": {
    		"errorCode": "CustomErrorName",
    		"message": "Error message"
    	}
    }
    ```
    
- **설명**:
    - `result`: 요청이 실패했음을 나타냅니다.
    - `status`: HTTP 상태 코드를 나타냅니다.
    - `success`: 항상 `null`입니다.
    - `error`: 에러 정보를 포함합니다.
        - `errorCode`: 에러 이름.
        - `message`: 에러 메시지.
- **예시**:
    
    ```
    {
    	"result": "Fail",
    	"status": 404,
    	"success": null,
    	"error": {
    		"errorCode": "NotFoundError",
    		"message": "User not found"
    	}
    }
    ```
    

---

**3. 주의사항**

- 모든 컨트롤러에서 응답을 반환할 때는 반드시 **`res.success`** 또는 **`res.error`*를 사용하세요.
- 에러를 발생시킬 때는 `throw`를 사용하고, 적절한 사용자 정의 에러 클래스를 활용하세요.
    - 예: `throw new ValidationError("Invalid input")`.

## 💻 기술 스택  
- Framework : Express.js  
- Database : MySQL,  Redis  
- DevOps : AWS EC2, AWS RDS, Docker  
- CI/CD : GitHub Actions  
