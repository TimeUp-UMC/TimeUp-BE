// 성공 응답
function successResponse(data = {}, message = "요청이 성공적으로 처리되었습니다.", status = 200) {
	return {
		result: "Success",
		status,
		success: {
			...data,
			message
		},
		error: null
	};
}

// 실패 응답
function errorResponse(errorInstance) {
	const { message, status = 500, errorCode = "InternalServerError" } = errorInstance;

	return {
		result: "Fail",
		success: null,
		error: {
			message,
			errorCode,
			status
		}
	};
}

export { successResponse, errorResponse };