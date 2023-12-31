
const socialLogin = async (req, res) => {

    if (req.user) {
  
      if (typeof req.user.userType === "undefined") {
        // 상세정보 미작성 회원
        const { token } = req.user;
        const response = {
          message: "NEW_USER",
          statusCode: 201,
          token 
        };

        res.json(response);
  
      } else {
        // 상세정보 작성 회원
        const { token, userType, isSubscribed } = req.user;
        const response = {
          message: "LOGIN_SUCCESS",
          statusCode: 200,
          token,
          userType,
          isSubscribed
        };
  
      res.json(response);
      
      }
    } else {
      res.status(400).json({
        message: "FAIL_TO_SIGN_UP",
      });
    }
  };
  
  module.exports = {
    socialLogin,
  };