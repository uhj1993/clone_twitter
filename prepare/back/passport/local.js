const passport = require(".");
const { Strategy: LocalStrategy } = require("passport-local");
const bcrypt = require("bcrypt");
const { User } = require("../models");
const user = require("../models/user");

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email", //req.body.email
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({
            where: { email },
          });

          if (!user) {
            return done(null, false, { reason: "존재하지 않는 이메일입니다." }); // 서버 에러, 성공, 클라이언트 에러
          }

          const result = await bcrypt.compare(password, user.password); //클라이언트에서 온 패스워드, DB패스워드 비교

          if (result) {
            return res.status(200).done(null, user);
          }

          return done(null, false, { reason: "비밀번호가 틀렸습니다." });
        } catch (error) {
          console.error(error);
          return done(error);
        }
      }
    )
  );
};
