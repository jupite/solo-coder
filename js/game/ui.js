import { CONFIG } from './config.js';

export class UISystem {
    constructor() {
        this.lapDisplay = document.getElementById('lap-display');
        this.timeDisplay = document.getElementById('time-display');
        this.bestLapDisplay = document.getElementById('best-lap-display');
        this.positionDisplay = document.getElementById('position-display');
        this.speedDisplay = document.getElementById('speed-display');
        this.lapTimesList = document.getElementById('lap-times-list');
        this.countdown = document.getElementById('countdown');
        this.boostIndicator = document.getElementById('boost-indicator');
        this.raceResult = document.getElementById('race-result');
        this.resultTitle = document.getElementById('result-title');
        this.resultStats = document.getElementById('result-stats');
        this.restartBtn = document.getElementById('restart-btn');
        
        this.currentLap = 1;
        this.totalLaps = CONFIG.RACE.TOTAL_LAPS;
        this.totalCars = CONFIG.AI.COUNT + 1;
        
        this.lapTimes = [];
        this.bestLapTime = null;
        this.currentPosition = 1;
    }

    updateLap(lap) {
        this.currentLap = lap;
        this.lapDisplay.textContent = `${lap} / ${this.totalLaps}`;
    }

    updateTime(time) {
        this.timeDisplay.textContent = this.formatTime(time);
    }

    updateBestLap(time) {
        if (time && (!this.bestLapTime || time < this.bestLapTime)) {
            this.bestLapTime = time;
            this.bestLapDisplay.textContent = this.formatTime(time);
        }
    }

    updatePosition(position) {
        this.currentPosition = position;
        this.positionDisplay.textContent = `${position} / ${this.totalCars}`;
    }

    updateSpeed(speed) {
        this.speedDisplay.textContent = Math.round(speed * 3.6);
    }

    addLapTime(lap, time) {
        this.lapTimes.push({ lap, time });
        
        const isBest = !this.bestLapTime || time < this.bestLapTime;
        if (isBest) {
            this.bestLapTime = time;
            this.bestLapDisplay.textContent = this.formatTime(time);
        }
        
        this.renderLapTimes();
    }

    renderLapTimes() {
        this.lapTimesList.innerHTML = '';
        
        this.lapTimes.forEach((lapTime, index) => {
            const isBest = lapTime.time === this.bestLapTime;
            const div = document.createElement('div');
            div.className = `lap-time-item${isBest ? ' best' : ''}`;
            div.innerHTML = `
                <span>第 ${lapTime.lap} 圈</span>
                <span>${this.formatTime(lapTime.time)}</span>
            `;
            this.lapTimesList.appendChild(div);
        });
    }

    showCountdown(number) {
        this.countdown.classList.remove('hidden');
        this.countdown.textContent = number > 0 ? number : 'GO!';
        this.countdown.style.animation = 'none';
        this.countdown.offsetHeight;
        this.countdown.style.animation = 'pulse 1s ease-in-out';
    }

    hideCountdown() {
        this.countdown.classList.add('hidden');
    }

    showBoostIndicator(show) {
        if (show) {
            this.boostIndicator.classList.remove('hidden');
        } else {
            this.boostIndicator.classList.add('hidden');
        }
    }

    showRaceResult(position, totalTime, lapTimes, bestLap) {
        this.raceResult.classList.remove('hidden');
        
        const positions = ['第一名', '第二名', '第三名', '第四名'];
        this.resultTitle.textContent = `比赛完成! ${positions[position - 1] || `第 ${position} 名`}`;
        
        this.resultStats.innerHTML = `
            <div class="result-stat">
                <span class="stat-label">最终排名</span>
                <span class="stat-value">${position} / ${this.totalCars}</span>
            </div>
            <div class="result-stat">
                <span class="stat-label">总时间</span>
                <span class="stat-value">${this.formatTime(totalTime)}</span>
            </div>
            <div class="result-stat">
                <span class="stat-label">最佳圈速</span>
                <span class="stat-value">${this.formatTime(bestLap)}</span>
            </div>
            <div class="result-stat">
                <span class="stat-label">完成圈数</span>
                <span class="stat-value">${this.totalLaps} 圈</span>
            </div>
        `;
    }

    hideRaceResult() {
        this.raceResult.classList.add('hidden');
    }

    formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor(ms % 1000);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }

    reset() {
        this.currentLap = 1;
        this.lapTimes = [];
        this.bestLapTime = null;
        this.currentPosition = 1;
        
        this.lapDisplay.textContent = `1 / ${this.totalLaps}`;
        this.timeDisplay.textContent = '00:00.000';
        this.bestLapDisplay.textContent = '--:--.---';
        this.positionDisplay.textContent = `1 / ${this.totalCars}`;
        this.speedDisplay.textContent = '0';
        this.lapTimesList.innerHTML = '';
        
        this.hideCountdown();
        this.hideBoostIndicator();
        this.hideRaceResult();
    }
}
