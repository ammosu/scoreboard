const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 7860;
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

const matchesFilePath = path.join(__dirname, 'data', 'matches.json');

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

        notifyClients(matches);
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

                notifyClients(matches);
                res.sendStatus(200);
            });
        } else {
            res.status(404).json({ message: 'Match not found' });
        }
    });
});

// 創建 HTTP 伺服器
const server = http.createServer(app);

// 創建 WebSocket 伺服器並綁定到相同的 HTTP 伺服器
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    fs.readFile(matchesFilePath, 'utf8', (err, data) => {
        if (!err) {
            ws.send(data);
        }
    });

    ws.on('message', (message) => {
        console.log(`Received message => ${message}`);
    });
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

function notifyClients(matches) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(matches));
        }
    });
}
