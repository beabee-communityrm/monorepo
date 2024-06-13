import { optionsService } from "@beabee/core";
import { NextFunction, Request, Response } from "express";

export const quickflash = function (
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const flash = req.flash(),
    flashes = [];

  for (const level of Object.keys(flash)) {
    const messages = flash[level]!;

    for (const message of messages) {
      const key = "flash-" + message;
      const optionMessage = optionsService.isKey(key)
        ? optionsService.getText(key)
        : message;

      flashes.push({
        type: level === "error" ? "danger" : level,
        message: optionMessage
      });
    }
  }
  res.locals.flashes = flashes;
  next();
}
