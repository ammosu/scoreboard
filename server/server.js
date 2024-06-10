const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 7860;
const wsPort = process.env.WS_PORT || 3001;


const matchesFilePath = path.join(__dirname, 'data', 'matches.json');
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/matches', (req, res) => {
    fs.readFile(matchesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading matches file:', err);
            res.sendStatus(500);
            return;
        }
        res.json(JSON.parse(data));
    });
});

app.post('/api/matches', (req, res) => {
    const { matches, password } = req.body;

    if (password !== adminPassword) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    fs.writeFile(matchesFilePath, JSON.stringify(matches), (err) => {
        if (err) {
            console.error('Error writing matches file:', err);
            res.sendStatus(500);
            return;
        }

        notifyClients(matches); // 通知所有客戶端
        res.sendStatus(200);
    });
});

app.post('/api/scores', (req, res) => {
    const { matchId, team1Score, team2Score, team1Wins, team2Wins, password } = req.body;

    if (password !== adminPassword) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    fs.readFile(matchesFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading matches file:', err);
            res.sendStatus(500);
            return;
        }

        const matches = JSON.parse(data);
        const match = matches.find(m => m.id === matchId);

        if (match) {
            if (team1Score !== undefined) match.team1Score = team1Score;
            if (team2Score !== undefined) match.team2Score = team2Score;
            if (team1Wins !== undefined) match.team1Wins = team1Wins;
            if (team2Wins !== undefined) match.team2Wins = team2Wins;

            fs.writeFile(matchesFilePath, JSON.stringify(matches), (err) => {
                if (err) {
                    console.error('Error writing matches file:', err);
                    res.sendStatus(500);
                    return;
                }

                notifyClients(matches); // 通知所有客戶端
                res.sendStatus(200);
            });
        } else {
            res.status(404).json({ message: 'Match not found' });
        }
    });
});

const server = app.listen(port, () => {
    console.log(`Scoreboard server running at http://localhost:${port}`);
});

const wss = new WebSocket.Server({ port: wsPort });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    fs.readFile(matchesFilePath, 'utf8', (err, data) => {
        if (!err) {
            ws.send(data);
        }
    });
});

function notifyClients(matches) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(matches));
        }
    });
}
