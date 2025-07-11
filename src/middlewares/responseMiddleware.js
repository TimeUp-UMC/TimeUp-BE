export default function responseMiddleware(req, res, next) {
	// 성공 응답
	res.success = (data = {}, status = 200) => {
	  res.status(status).json({
		result: "Success",
		status,
		success: data,
		error: null
	  });
	};
	
	// 실패 응답
	res.error = (error, status = 400) => {
	  res.status(status).json({
		result: "Fail",
		status,
		success: null,
		error: {
		  errorCode: error.name || "Error",
		  message: error.message || "An error occurred"
		}
	  });
	};
  
	next();
  }
  