import { sign, verify } from "hono/jwt";

export const generateTokens = async (params: {
  userId: string;
  securityLevel: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
}) => {
  const { userId, securityLevel, jwtSecret, jwtRefreshSecret } = { ...params };

  const accessToken = await sign(
    {
      id: userId,
      securityLevel,
      exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 min
    },
    jwtSecret,
  );

  const refreshToken = await sign(
    {
      id: userId,
      securityLevel,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    },
    jwtRefreshSecret,
  );

  return { accessToken, refreshToken };
};


export const verifyToken = async (params:{
   token:string,
   jwtSecret:string
})=>{
   const {token, jwtSecret} = {...params};
   return await verify(token, jwtSecret,"HS256")
}