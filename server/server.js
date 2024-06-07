const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const port = 3000;
const wsPort = 3001;

const scoresFilePath = path.join(__dirname, 'data', 'scores.json');
const adminPassword = "admin123"; // 簡單的靜態密碼，僅示範用途

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/scores', (req, res) => {
    fs.readFile(scoresFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading scores file:', err);
            res.sendStatus(500);
            return;
        }
        res.json(JSON.parse(data));
    });
});

app.post('/api/scores', (req, res) => {
    const { team1, team2, team1Wins, team2Wins, team1Name, team2Name, password } = req.body;

    if (password !== adminPassword) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    fs.readFile(scoresFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading scores file:', err);
            res.sendStatus(500);
            return;
        }

        const scores = JSON.parse(data);

        // 更新分數和隊伍名稱
        if (team1 !== undefined) scores.team1 = team1;
        if (team2 !== undefined) scores.team2 = team2;
        if (team1Wins !== undefined) scores.team1Wins = team1Wins;
        if (team2Wins !== undefined) scores.team2Wins = team2Wins;
        if (team1Name !== undefined) scores.team1Name = team1Name;
        if (team2Name !== undefined) scores.team2Name = team2Name;

        fs.writeFile(scoresFilePath, JSON.stringify(scores), (err) => {
            if (err) {
                console.error('Error writing scores file:', err);
                res.sendStatus(500);
                return;
            }

            // 通知所有WebSocket客戶端分數和名稱已更新
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(scores));
                }
            });

            res.sendStatus(200);
        });
    });
});

const server = app.listen(port, () => {
    console.log(`Scoreboard server running at http://localhost:${port}`);
});

const wss = new WebSocket.Server({ port: wsPort });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    fs.readFile(scoresFilePath, 'utf8', (err, data) => {
        if (!err) {
            ws.send(data);
        }
    });
});
