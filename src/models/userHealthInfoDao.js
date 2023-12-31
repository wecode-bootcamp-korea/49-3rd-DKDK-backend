const { AppDataSource } = require("./dataSource");
const { throwError } = require("../utils/throwError");

const checkExistence = async (userId) => {
  const exist = await AppDataSource.query(
    ` SELECT id FROM users where id = ?`,
    [userId]
  );
  return exist.length === 1;
};

const checkUserType = async (userId) => {
  return await AppDataSource.query(
    `SELECT user_type FROM users u WHERE u.id = ?`,
    [userId]
  );
};

// GET - 유저 정보
const getUser = async (userId) => {
  return await AppDataSource.query(
    `
    SELECT u.img_url AS profileImg,
      u.nickname as nickname,
      u.gender AS gender,
      u.phone_number AS phoneNumber,
      u.height AS height,
      u.weight AS weight,
      u.birthday AS birthday,
      wc.category AS interested_workout,
      CASE
        WHEN u.workout_load = 1 THEN '상'
        WHEN u.workout_load = 2 THEN '중'
        ELSE '하' END AS workoutLoad,
      CASE
        WHEN (SELECT so.end_at FROM sub_orders so WHERE so.user_id = u.id) IS NULL THEN 'false'
        ELSE (SELECT DATE(so.end_at) FROM sub_orders so WHERE so.user_id = u.id)
      END AS subEndDate
    FROM users u
    JOIN workout_categories wc ON wc.id = u.interested_workout
    WHERE u.id = ?;
    `,
    [userId]
  );
};

// GET - 트레이너 정보
const getTrainerInfo = async (userId) => {
  const trainerInfo = await AppDataSource.query(
    `
    SELECT
      wc.category AS specialized,
      COUNT(DISTINCT po.buyer_user_id) AS customers,
      (SELECT COUNT(*) FROM comments c2 WHERE c2.user_id = t.user_id) AS comments
    FROM trainers t
    LEFT JOIN users u ON u.id = t.user_id
    LEFT JOIN products p ON p.trainer_id = t.id
    LEFT JOIN pt_orders po ON po.product_id = p.id
    LEFT JOIN workout_categories wc ON wc.id = t.specialized
    WHERE u.id = ?
    GROUP BY specialized;
    `,
    [userId]
  );
  return trainerInfo.length === 0 ? "NOT_A_TRAINER" : trainerInfo;
};

// GET - PT 주문정보 (최적화 필요)
const getPtOrderByUserId = async (userId) => {
  const ptOrderDetail = await AppDataSource.query(
    `
    SELECT
      (SELECT u.nickname FROM users u WHERE u.id = t.user_id) AS trainerName,
      (SELECT u.img_url FROM users u WHERE u.id = t.user_id) AS profileImg,
      (SELECT u.gender FROM users u WHERE u.id = t.user_id) AS gender,
      (SELECT u.phone_number FROM users u WHERE u.id = t.user_id) AS phoneNumber,
      (SELECT u.height FROM users u WHERE u.id = t.user_id) AS height,
      (SELECT u.weight FROM users u WHERE u.id = t.user_id) AS weight,
      t.specialized AS specialized,
      (SELECT COUNT(DISTINCT po.buyer_user_id)
        FROM pt_orders po
        JOIN products p ON p.id = po.product_id
        WHERE p.trainer_id = t.id) AS customers,
      (SELECT COUNT(*) FROM comments c WHERE c.user_id = t.user_id) AS comments,
      wc.category AS category,
      DATE_FORMAT(DATE_ADD(p.created_at, INTERVAL p.term MONTH), '%Y-%m-%d') AS end_at,
      p.available_area AS availableArea
    FROM pt_orders po
    JOIN products p ON p.id = po.product_id
    JOIN trainers t ON p.trainer_id = t.id
    JOIN workout_categories wc ON p.category_name = wc.id
    WHERE po.buyer_user_id = ?
    `,
    [userId]
  );
  return ptOrderDetail.length === 0 ? "NO_PT_ORDERS" : ptOrderDetail;
};

// GET - 구독권 정보
const getSubOrdersInfoByUserId = async (userId) => {
  const subOrderDetails = await AppDataSource.query(
    `
    SELECT so.user_id AS userId,
        so.sub_id AS subscriptionId,
        s.price AS price,
        s.term As term,
        so.created_at AS orderedAt,
        so.end_at AS endAt
    FROM sub_orders so
    JOIN subscriptions s ON so.sub_id = s.id
    WHERE so.user_id = ?;
    `,
    [userId]
  );
  return subOrderDetails.length === 0 ? "NO_SUB_ORDERS" : subOrderDetails;
};

// GET - 식단
const getRandFoodByGrade = async (grade) => {
  const [result] = await AppDataSource.query(
    `
    SELECT f.meal_plan_id as id,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'typeId', f.type_id,
            'name', f.name,
            'kcal', f.kcal,
            'weight', f.weight,
            'imgUrl', f.img_url
            )
          ) AS mealPlan
        FROM foods f
        JOIN meal_plans mp ON mp.id = f.meal_plan_id
        JOIN food_types ft on ft.id = f.type_id
        WHERE mp.grade = ?
        GROUP BY f.meal_plan_id
        ORDER BY RAND()
        LIMIT 1;
    `,
    [grade]
  );
  result.mealPlan = JSON.parse(result.mealPlan);
  return result;
};

// GET - 추천 운동
const getRandWorkoutByUserId = async (userId, limit = 5) => {
  return await AppDataSource.query(
    `
    SELECT * FROM workouts w
    JOIN workout_categories wc ON wc.id = w.category_id
    WHERE w.category_id = (SELECT interested_workout FROM users u WHERE u.id = ?)
    ORDER BY RAND()
    LIMIT ?;
    `,
    [userId, limit]
  );
};

/* 유저 프로파일 수정 기능 */
// 수정할 정보 불러오기 - 완료
const getUserDataToModify = async (userId) => {
  return await AppDataSource.query(
    `
    SELECT u.id AS userId,
      u.nickname AS nickname,
      u.birthday AS birthday,
      u.gender AS gender,
      u.user_type AS userType,
      u.height AS height,
      u.weight AS weight,
      u.interested_workout AS interestedWorkout,
      u.workout_load AS workoutLoad,
      u.img_url AS imgUrl,
      t.specialized AS specialized
    FROM users u
    LEFT JOIN trainers t ON t.user_id = u.id 
    WHERE u.id = ?
    `,
    [userId]
  );
};

// 유저정보 수정 - 이미지 포함
const updateUserInfoById = async (
  userId,
  imageUrl,
  gender,
  birthday,
  height,
  weight,
  workoutLoad,
  interestedWorkout
) => {
  const result = await AppDataSource.query(
    `
    UPDATE users
      SET img_url = ?,
      gender = ?,
      birthday = ?,
      height = ?,
      weight = ?,
      workout_load = ?,
      interested_workout = ?
    WHERE id = ?
    `,
    [
      imageUrl,
      gender,
      birthday,
      height,
      weight,
      workoutLoad,
      interestedWorkout,
      userId,
    ]
  );
  return result.affectedRows;
};

// 트레이너가 정보 업데이트
const updateTrainerInfoById = async (
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
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const updateUserInfo = await queryRunner.query(
      `
    UPDATE users
      SET img_url = ?,
      gender = ?,
      birthday = ?,
      height = ?,
      weight = ?,
      workout_load = ?,
      interested_workout = ?
    WHERE id = ?
    `,
      [
        imageUrl,
        gender,
        birthday,
        height,
        weight,
        workoutLoad,
        interestedWorkout,
        userId,
      ]
    );
    const updateTrainerInfo = await queryRunner.query(
      `
      UPDATE trainers t
      JOIN users u ON u.id = t.user_id
      SET t.specialized = ?
      WHERE u.id = ?;
      `,
      [specialized, userId]
    );

    const resultUser = updateUserInfo.affectedRows;
    const resultTrainer = updateTrainerInfo.affectedRows;

    await queryRunner.commitTransaction();

    return { resultUser, resultTrainer };
  } catch (error) {
    console.error(error);
    await queryRunner.rollbackTransaction();
    throwError(500, "FAILED_TO_UPDATE");
  } finally {
    await queryRunner.release();
  }
};

module.exports = {
  checkExistence,
  checkUserType,
  getUser,
  getTrainerInfo,
  getPtOrderByUserId,
  getSubOrdersInfoByUserId,
  getRandFoodByGrade,
  getRandWorkoutByUserId,
  updateUserInfoById,
  updateTrainerInfoById,
  getUserDataToModify,
};
