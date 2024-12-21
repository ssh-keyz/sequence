import { NextFunction, Request, Response } from "express";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...args: string[]) => twMerge(clsx(...args));

const tailwindMiddleware = (
  _request: Request,
  response: Response,
  next: NextFunction,
) => {
  response.locals.cn = cn;
  next();
};

export default tailwindMiddleware;
