// const WebSocket = require('ws');
import { WebSocketServer, WebSocket } from 'ws';
// const { TOKEN, HOST, ID } = process.env;

const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzM4NCJ9.eyJleHAiOjE3MzQ2MDUwNzksInVzZXJfaWQiOiJJVEdfU1JHIn0.KsLwGka2d4k9VkpQS8QAnlLbitdyC42Szb_M_VWlR7lqSatzxSIPvrJY5e01KuSY';
const HOST = 'shelly-101-eu.shelly.cloud';
const ID = '224830197357980';

const wss = `wss://${HOST}:6113/shelly/wss/hk_sock`;
const sock = new WebSocket(`${wss}?t=${TOKEN}`);

sock.on('open', () => {
    console.log(`| WS Open @ ${wss} |\n`);

    sendThroughWSS([
        BuildEvent.ActionRequest.DeviceVerify(ID),

        // Relay example
        BuildEvent.CommandRequest.Relay('off', ID),

        // Roller example
        // BuildEvent.CommandRequest.Roller('open', ID),
        // BuildEvent.CommandRequest.RollerToPos(50, ID),

        // // Light example
        // BuildEvent.CommandRequest.Light('on', ID),
    ]);

}).on('message', (message) => {
    console.log("<-- RECEIVED");
    console.log(`    ${message}`)

}).on('error', (error) => {
    console.log(`On Error: ${error.message}`);

}).on("close", (code, reason) => {
    console.log(`On Close: ${code} ${reason}`);
})

const makeTransactionId = () => Math.floor(Math.random() * 999);
const BuildEvent = {

    ActionRequest: {
        DeviceVerify(deviceId) {
            return JSON.stringify({
                event: "Integrator:ActionRequest",
                trid: makeTransactionId(),
                data: { action: 'DeviceVerify', deviceId }
            });
        }
    },

    CommandRequest: {

        /**
         * @param {string} turn `on`|`off`|`toggle`
         * @param {string} deviceId
         * @param {number} timeout optional, one-shot flip-back timer in seconds
         */
        Relay(turn, deviceId, timeout) {
            return JSON.stringify({
                event: "Shelly:CommandRequest",
                trid: makeTransactionId(),
                deviceId,
                data: {
                    cmd: "relay",
                    params: { id: 0, turn, timeout },
                }
            });
        },

        /**
         * @param {string} go `stop`|`open`|`close`
         * @param {string} deviceId
         */
        Roller(go, deviceId) {
            return JSON.stringify({
                event: "Shelly:CommandRequest",
                trid: makeTransactionId(),
                deviceId,
                data: {
                    cmd: "roller",
                    params: { id: 0, go },
                }
            });
        },

        /**
         * @param {number} pos desired position in percent
         * @param {string} deviceId
         */
        RollerToPos(pos, deviceId) {
            return JSON.stringify({
                event: "Shelly:CommandRequest",
                trid: makeTransactionId(),
                deviceId,
                data: {
                    cmd: "roller_to_pos",
                    params: { id: 0, pos },
                }
            });
        },

        /**
         * @param {string} turn `on`|`off`|`toggle`
         * @param {string} deviceId
         * @param {number} timeout optional, one-shot flip-back timer in seconds
         */
        Light(turn, deviceId, timeout) {
            return JSON.stringify({
                event: "Shelly:CommandRequest",
                trid: makeTransactionId(),
                deviceId,
                data: {
                    cmd: "light",

                    // NOTE: for full list of supported parameters see:
                    // https://shelly-api-docs.shelly.cloud/gen1/#shelly-bulb-light-0
                    params: { id: 0, turn, timeout, mode: 'white', temp: 4000 },
                }
            });
        }
    }
};

async function sendThroughWSS(commands) {
    for (let command of commands) {
        sock.send(command);
        console.log("--> SEND");
        console.log(`    ${command}`)

        // simulate sleep for 5 sec
        await new Promise(resolve => setTimeout(resolve, 5 * 1000))
    }
}
