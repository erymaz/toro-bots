import express, { Express, response } from "express";
import { respond } from "@torobot/shared";
import { triggerBot } from "../bot";

export const initRoutes = (app: Express) => {
  app.post("/bot/trigger", async (req, res) => {
    const payload = req.body;
    let response = {};

    try {
      const result = await triggerBot(payload);
      response = respond.success(result);
    } catch (e) {
      response = respond.error(`Failed to trigger bot(${payload.botId})`);
    }
    return res.json(response);
  });
}