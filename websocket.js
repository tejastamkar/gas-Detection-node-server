import { WebSocketServer } from "ws";
const sockserver = new WebSocketServer({ port: 8765 });
import Url from "url";
import axios from "axios";
import { pythonserverUrl } from "./var.js";

export let webSockets = new Map();
export const webSocketFun = async () => {
  try {
    sockserver.on("connection", async (ws, req) => {
      const queryObject = Url.parse(req.url, true).query; //get userid from URL ip:8080/chatId

      const [id, devicesId] = [queryObject.id, queryObject.devicesId];

      webSockets[Number(id)] = ws; //add new user to the connection list
      console.log(`Client ${id} connected!`);
      // Check if senderId and receiverId have a chat data in the chat table
      ws.send(JSON.stringify({ cmd: "connected" }));

      ws.on("open", () => console.log("Client has connected!"));
      ws.on("message", async (message) => {
        try {
          console.log(`Received message => ${message}`);
          if (!message.includes("cmd")) {
            return;
          }
          var data = JSON.parse(message);
          if (data["cmd"] === "send") {
            if (data["data"] === "cleaned") {
              webSockets[devicesId].send(
                JSON.stringify({ cmd: "cleaned", data: data })
              );
              return;
            }
            webSockets[devicesId].send(
              JSON.stringify({ cmd: "reciver", data: data["data"] })
            );
          }
          if (data["cmd"] === "NEW") {
            const stage = await axios.post(`${pythonserverUrl}/getKNN`, {
              data: {
                MQ2: data["MQ2"],
                MQ3: data["MQ3"],
                T00: data["T00"],
                T02: data["T02"],
                MQ9: data["MQ9"],
                MQ6: data["MQ6"],
              },
            });
            const sendData = { ...data, stage: stage["data"]["category"] };
            webSockets[devicesId].send(JSON.stringify(sendData));
            webSockets[id].send(JSON.stringify({ cmd: "DISPLAY", stage: stage["data"]["category"] , type: data["type"] }));
          }
        } catch (e) {
          console.error("Error parsing message to JSON:", e);
        }
      });

      ws.on("close", () => {
        webSockets.delete(id);
        console.log("Client has disconnected!");
      });
      ws.onerror = function () {
        console.log("websocket error");
      };
    });
  } catch (e) {
    console.error(e);
  }
};
