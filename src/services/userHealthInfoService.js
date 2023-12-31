const { userHealthInfoDao } = require("../models");
const { throwError } = require("../utils/throwError");

const getUserInfo = async (userId, workoutRcmdLimit) => {
  const bmiCalculator = () => {
    const height = userInfo[0].height;
    const weight = userInfo[0].weight;
    const bmi = weight / Math.sqrt(height);
    if (bmi < 18.5) return 1800;
    if (bmi >= 18.5 && bmi <= 23) return 1600;
    if (bmi > 23) return 1400;
  };
  const userInfo = await userHealthInfoDao.getUser(userId);
  const trainerInfo = await userHealthInfoDao.getTrainerInfo(userId);
  const ptOrderInfo = await userHealthInfoDao.getPtOrderByUserId(userId);
  const subOrderInfo = await userHealthInfoDao.getSubOrdersInfoByUserId(userId);
  const workoutRcmd = await userHealthInfoDao.getRandWorkoutByUserId(
    userId,
    workoutRcmdLimit
  );
  const foodRcmd = await userHealthInfoDao.getRandFoodByGrade(bmiCalculator());
  return {
    userInfo: userInfo,
    trainerInfo: trainerInfo,
    ptOrderInfo: ptOrderInfo,
    subOrderInfo: subOrderInfo,
    foodRcmd: foodRcmd,
    workoutRcmd: workoutRcmd,
  };
};

/*  유저 정보 수정 프로세스 */
const getToBeUpdatedInfo = async (userId) => {
  return await userHealthInfoDao.getUserDataToModify(userId);
};

// 유저정보 수정
const updateUserInfo = async (
  userId,
  imageUrl,
  gender,
  birthday,
  height,
  weight,
  workoutLoad,
  interestedWorkout,
  specialized
) => {
  const type = await userHealthInfoDao.checkUserType(userId);
  if (type[0].user_type !== 1 && type[0].user_type !== 2)
    throwError(400, "NO_SUCH_USER_TYPE"); // userType Checker
  if (type[0].user_type == 1) {
    const result = await userHealthInfoDao.updateUserInfoById(
      userId,
      imageUrl,
      gender,
      birthday,
      height,
      weight,
      workoutLoad,
      interestedWorkout
    );
    return result == 1 ? "DATA_UPDATED" : throwError(400, "DATA_UPDATE_FAIL");
  }
  if (type[0].user_type == 2) {
    const result = await userHealthInfoDao.updateTrainerInfoById(
      userId,
      imageUrl,
      gender,
      birthday,
      height,
      weight,
      workoutLoad,
      interestedWorkout,
      specialized
    );
    return result.resultUser == 1 && result.resultTrainer == 1
      ? "DATA_UPDATED"
      : thorwError(400, "DATA_UPDATE_FAILED");
  }
};

// 프로파일 업로드 확인
const updateUserImg = async (userId, profileImg) => {
  const result = await userHealthInfoDao.updateUserImg(userId, profileImg);
  return result == 1
    ? "PROFILE_IMG_UPLOADED"
    : throwError(400, "IMG_UPLOAD_FAIL");
};
module.exports = {
  getUserInfo,
  getToBeUpdatedInfo,
  updateUserInfo,
  updateUserImg,
};
