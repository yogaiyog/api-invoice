import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

// type IUser =  {
//     id:string,
//     email:string
// }

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw "Token is empty";

    const verifiedToken = verify(token, process.env.SECRET_JWT! || "sangat rahasia");

      // req.user = verifiedToken as IUser

    req.body = { ...req.body, token: verifiedToken };

    next();
  } catch (err) {
    res.status(400).send({
      status: "Error token",
      message: err
    });
  }
};
