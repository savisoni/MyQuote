const jwtStrategy= require("passport-jwt").Strategy;
const ExtractJwt= require("passport-jwt").ExtractJwt;
const User = require("../models/user")
const jwtOptions={
    jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey :"somesecretkey"
}

module.exports=(passport)=>{
    passport.use(new jwtStrategy(jwtOptions,async(jwtPayload,done)=>{
        try {
            console.log("jwtPayload", jwtPayload);
            const user = await User.findByPk(jwtPayload.id)
            if (user) {
                console.log("user=====>", user);
                return done(null,user)
            }
    
            else{
                return done(null,false)
            }
        } catch (error) {
            return done(error,false)
        }
    }))
}
