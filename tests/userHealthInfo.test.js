const request = require("supertest");

// supertest의 request에 app을 담아 활용하기 위해 createApp 함수를 불러옵니다.
const { createApp } = require("../app");
// DB와의 커넥션을 위해 DataSource 객체를 불러옵니다.
const { AppDataSource } = require("../src/models/dataSource");

describe("GET User Information", () => {
  let app;

  beforeAll(async () => {
    // 모든 테스트가 시작하기 전(beforeAll)에 app을 만들고, DataSource를 이니셜라이징 합니다.
    app = createApp();
    await AppDataSource.initialize();

    // GET 테스트를 위한 DB필수정보 생성

    // 1. workout category
    await AppDataSource.query(
      `INSERT INTO workout_categories (id, category)
      VALUES
      (1, '헬스'),
      (2, '필라테스'),
      (3, '요가');
      `
    );

    // 2. USER정보 생성
    await AppDataSource.query(
      `INSERT INTO users
      (id, nickname, birthday, gender, phone_number, user_type, height, weight, interested_workout, workout_load)
        VALUES
      (1, '테스터', '2023-10-10', 1, 01012341234, 1, 186.00, 78.00, 1, 1);
      `
    );
  });

  afterAll(async () => {
    // 테스트 데이터베이스의 불필요한 데이터를 전부 지워줍니다.
    // 테이블에 있는 데이터를 날려주는 코드
    await AppDataSource.query(`SET FOREIGN_KEY_CHECKS = 0;`);
    await AppDataSource.query(`TRUNCATE TABLE workout_categories;`);
    await AppDataSource.query(`TRUNCATE TABLE users;`);
    await AppDataSource.query(`SET FOREIGN_KEY_CHECKS = 1;`);

    // 모든 테스트가 끝나게 되면(afterAll) DB 커넥션을 끊어줍니다.
    await AppDataSource.destroy();
  });

  test("FAILED: GET - NO USER ID", async () => {
    // supertest의 request를 활용하여 app에 테스트용 request를 보냅니다.
    const res = await request(app)
      .get("/userHealthInfo") // HTTP Method, 엔드포인트 주소를 작성합니다.
      .expect(400); // expect()로 예상되는 statusCode, response를 넣어 테스트할 수 있습니다.

    expect(res.body.message).toEqual("KEY_ERROR - ID");
  });

  test("FAILED: GET - NO SUCH USER", async () => {
    const res = await request(app)
      .get("/userHealthInfo?userId=999999")
      .expect(400);

    expect(res.body.message).toEqual("KEY_ERROR_NO_SUCH_USER");
  });

  // 다음과 같이 본인이 작성한 코드에 맞춰 다양한 케이스를 모두 테스트해야 합니다.
  // 그래야 의도에 맞게 코드가 잘 작성되었는지 테스트 단계에서부터 확인할 수 있습니다!
  test("SUCCESS: GET - INFO_LOADED", async () => {
    const res = await request(app).get(`/userHealthInfo?userId=1}`);
    expect(200);
    expect(res.body.message).toEqual("MYPAGE_LOADED");
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toMatchObject({
      userInfo: [{}],
      trainerInfo: "NOT_A_TRAINER",
      ptOrderInfo: "NO_PT_ORDERS",
      subOrderInfo: "NO_SUB_ORDERS",
      foodRcmd: [],
      workoutRcmd: []
    });
  });
});