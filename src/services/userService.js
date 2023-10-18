const { throwError } = require("../utils");
const { userDao } = require("../models");
const { findByUserId, updateUser } = userDao;

const detailUpdateUser = async (
  userId,
  userType,
  imgUrl,
  nickname,
  phoneNumber,
  gender,
  birthday,
  height,
  weight,
  interestedWorkout,
  workoutLoad,
  specialized
) => {
  try {
    // 회원 가입 여부 확인
    const isUser = await findByUserId(userId);
    if (!isUser) throwError(400, "INVAILD_USER");

    //닉네임 유효성 검사 : 한글 6자 이내
    const nicknameRegex = /^[가-힣]{1,6}$/;
    if (!nicknameRegex.test(nickname)) throwError(400, "INVAILD_NICKNAME");

    //폰번호 유효성 검사 : 01048854885
    const phoneNumberRegex = /^01[016-9]\d{3,4}\d{4}$/;
    if (!phoneNumberRegex.test(phoneNumber)) throwError(400, "INVAILD_PHONE_NUMBER");

    //생일 유효성 검사 : 유효한 날짜
    const date = new Date(birthday);
    const isValidDate = !isNaN(date.getTime());
    if (!isValidDate) throwError(400, "INVAILD_DATE");

    //키,몸무게 유효성 검사 : 0 이상
    if (height <= 0 || weight <= 0) throwError(400, "INVAILD_NUMERIC");

    const result = await updateUser(
      userId,
      userType,
      imgUrl,
      nickname,
      phoneNumber,
      gender,
      birthday,
      height,
      weight,
      interestedWorkout,
      workoutLoad,
      specialized
    );

    console.log("service result : ", result)
    
    return result;
    
  } catch (err) {
    console.error(err);
    return err;
    
  }
};

module.exports = {
  detailUpdateUser,
};