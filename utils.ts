import { api, data, params, storage } from "@serverless/cloud";

import jwt from "jsonwebtoken";

/*
 * HELPER FUNCTIONS
 */
export function generateToken(id) {
  return jwt.sign({ id }, params.JWT_SECRET, { expiresIn: "1d" });
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, params.JWT_SECRET as string, (err: any, user: any) => {
    console.log("JWT verify error?", err);

    if (err) return res.sendStatus(403);

    req.user = user;

    next();
  });
}

export async function getUserByEmail(email) {
  return await data.getByLabel("label1", email.trim().toLowerCase());
}

export async function getUserById(id) {
  return await data.getByLabel(`id:${id}`);
}
