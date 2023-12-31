const { AppDataSource } = require("../models/dataSource");
const { createConnection } = require("typeorm");
const { throwError } = require("../utils/throwError");

const findUserByProviderId = async (provider, providerId) => {
  const columnName = provider === "kakao" ? "kakao_id" : "naver_id";

  const [result] = await AppDataSource.query(
    `
        SELECT id, user_type
        FROM users
        WHERE ${columnName} = ?
    `,
    [providerId]
  );

  return result;
};

const updateUserImgUrl = async (userId, imgUrl) => {
  const result = await AppDataSource.query(
    `
      UPDATE users 
      SET img_url = ?
      WHERE id = ?
    `,
    [imgUrl, userId]
  );

  return result;
};

const createUserByProviderId = async (provider, providerId, imgUrl) => {
  const columnName = provider === "kakao" ? "kakao_id" : "naver_id";

  const result = await AppDataSource.query(
    `
    INSERT INTO users 
    (${columnName}, img_url) 
    VALUES (?, ?)
    `,
    [providerId, imgUrl]
  );

  if (result.insertId) {
    return {
      id: result.insertId,
    };
  } else {
    throwError(401, "FAIL_TO_CREATE_USER");
  }
};

const isSubscribed = async (userId) => {
  const [result] = await AppDataSource.query(
    `
      SELECT id
      FROM sub_orders
      WHERE user_id = ?
      AND end_at > NOW()
    `,
    [userId]
  );

  return !!result;
};

const findByUserId = async (userId) => {
  const [result] = await AppDataSource.query(
    `
    SELECT id, user_type
    FROM users
    WHERE id = ?
    `,
    [userId]
  );

  return result;
};

const findUserByNickname = async (nickname) => {
  const [result] = await AppDataSource.query(
    `
     SELECT nickname
     FROM users
     WHERE nickname = ?
  `,
    [nickname]
  );
  
  return !!result;
};

const updateUser = async (
  userId,
  userType,
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
  const connection = await createConnection();
  try {
    const result = await connection.transaction(async (transactionalEntityManager) => {
      //1. 유저 정보 업데이트
      const userUpdate = await transactionalEntityManager.query(
        `
            UPDATE users
            SET 
                user_type = ?,
                nickname = ?,
                phone_number = ?,
                gender = ?,
                birthday = ?,
                height = ?,
                weight = ?,
                interested_workout = ?,
                workout_load =?
            WHERE id = ?
          `,
        [userType, nickname, phoneNumber, gender, birthday, height, weight, interestedWorkout, workoutLoad, userId]
      );

      //2. 트레이너 회원의 경우 트레이너 정보 생성
      const userTypes = {
        USER: "1",
        TRAINER: "2",
      };
      if (userType === userTypes.TRAINER) {
        const createTrainer = await transactionalEntityManager.query(
          `
            INSERT INTO trainers
            (user_id, specialized)
            VALUES (?, ?)
          `,
          [userId, specialized]
        );
      }

      if (userUpdate.affectedRows > 0) {
        return {
          userId: userId,
          userType: userType,
        };
      } else {
        throwError(401, "FAIL_TO_UPDATE_USER");
      }
    });
    return result;
  } catch (err) {
    console.error(err);
    throwError(400, "TRANSACTION_ERROR");
  } finally {
    await connection.close();
  }
};

module.exports = {
  findUserByProviderId,
  findByUserId,
  isSubscribed,
  updateUserImgUrl,
  createUserByProviderId,
  findUserByNickname,
  updateUser,
};
