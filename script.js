// 初始化数据
let data = {
    behaviors: [],
    currentScore: 65,
    warningLine: 60
};

// 从localStorage加载数据
function loadData() {
    const savedData = localStorage.getItem('networkGateData');
    if (savedData) {
        data = JSON.parse(savedData);
    }
}

// 保存数据到localStorage
function saveData() {
    localStorage.setItem('networkGateData', JSON.stringify(data));
}

// 计算当前状态分数
function calculateScore() {
    let prosperityScore = 0;
    let declineScore = 0;
    
    data.behaviors.forEach(behavior => {
        if (behavior.direction === 'prosperity') {
            prosperityScore += parseFloat(behavior.value);
        } else {
            declineScore += parseFloat(behavior.value);
        }
    });

    return 65 + prosperityScore - declineScore;
}

// 更新图表
function updateChart() {
    const ctx = document.getElementById('statusChart').getContext('2d');
    const timeUnit = document.getElementById('timeUnit').value;
    
    const labels = generateTimeLabels(timeUnit);
    const scores = generateScoreData(labels, timeUnit);

    // 添加调试日志
    console.log('更新图表 - 时间标签:', labels);
    console.log('更新图表 - 分数数据:', scores);
    console.log('更新图表 - 行为数据:', data.behaviors);

    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '状态分数',
                data: scores,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: Math.max(0, Math.min(...scores) - 10),
                    max: Math.max(...scores) + 10
                }
            },
            plugins: {
                legend: {
                    display: true
                },
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: data.warningLine,
                            yMax: data.warningLine,
                            borderColor: 'rgb(255, 99, 132)',
                            borderWidth: 2,
                            label: {
                                content: '预警线',
                                enabled: true,
                                position: 'left'
                            }
                        }
                    }
                }
            }
        }
    });

    // 获取当前分数
    const currentScore = calculateScore();
    
    // 检查分数范围并显示相应消息
    if (currentScore < data.warningLine) {
        alert("你妈的，你不是要改变世界吗？你现在在干什么？你不能和学校里面的那些人一样，你得跟无数创业者竞争，给老子干！往死里干！");
    } else if (currentScore >= 80 && currentScore < 85) {
        alert("干得好！Benson加油！继续往死里干！");
    } else if (currentScore >= 85 && currentScore <= 90) {
        alert("Elon提醒您：不要只顾着低头赶路，记得抬头看路哦");
    }
}

// 生成时间标签
function generateTimeLabels(timeUnit) {
    const now = new Date();
    const labels = [];
    const count = 10; // 显示最近10个时间点

    for (let i = count - 1; i >= 0; i--) {
        const date = new Date(now);
        switch (timeUnit) {
            case 'hour':
                date.setHours(now.getHours() - i);
                labels.push(date.getHours() + ':00');
                break;
            case 'day':
                date.setDate(now.getDate() - i);
                labels.push((date.getMonth() + 1) + '/' + date.getDate());
                break;
            case 'week':
                date.setDate(now.getDate() - i * 7);
                labels.push((date.getMonth() + 1) + '/' + date.getDate());
                break;
        }
    }
    return labels;
}

// 生成分数数据
function generateScoreData(labels, timeUnit) {
    const scores = [];
    const now = new Date();
    
    // 添加调试日志
    console.log('生成分数 - 开始时间:', now);
    console.log('生成分数 - 时间单位:', timeUnit);

    labels.forEach((_, index) => {
        let targetTime = new Date(now);
        
        switch (timeUnit) {
            case 'hour':
                targetTime.setHours(now.getHours() - (9 - index));
                targetTime.setMinutes(59);
                targetTime.setSeconds(59);
                break;
            case 'day':
                targetTime.setDate(now.getDate() - (9 - index));
                targetTime.setHours(23, 59, 59);
                break;
            case 'week':
                targetTime.setDate(now.getDate() - (9 - index) * 7);
                targetTime.setHours(23, 59, 59);
                break;
        }

        // 添加调试日志
        console.log(`生成分数 - 时间点 ${index}:`, targetTime);
        
        const score = calculateScoreAtTime(targetTime);
        console.log(`生成分数 - 分数 ${index}:`, score);
        
        scores.push(score);
    });

    return scores;
}

// 计算特定时间点的分数
function calculateScoreAtTime(targetTime) {
    let prosperityScore = 0;
    let declineScore = 0;
    
    data.behaviors.forEach(behavior => {
        const behaviorTime = new Date(behavior.timestamp);
        if (behaviorTime <= targetTime) {
            if (behavior.direction === 'prosperity') {
                prosperityScore += parseFloat(behavior.value);
            } else {
                declineScore += parseFloat(behavior.value);
            }
        }
    });

    const finalScore = 65 + prosperityScore - declineScore;
    
    // 添加调试日志
    console.log('计算分数 - 目标时间:', targetTime);
    console.log('计算分数 - 繁荣分数:', prosperityScore);
    console.log('计算分数 - 凋零分数:', declineScore);
    console.log('计算分数 - 最终分数:', finalScore);

    return finalScore;
}

// 更新历史记录显示
function updateHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    data.behaviors.slice().reverse().forEach(behavior => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <span>${behavior.direction === 'prosperity' ? '繁荣' : '凋零'}方向</span>
            <span>分数：${behavior.value}</span>
            <span>${new Date(behavior.timestamp).toLocaleString()}</span>
        `;
        historyList.appendChild(item);
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    updateChart();
    updateHistory();

    // 监听时间单位变化
    document.getElementById('timeUnit').addEventListener('change', updateChart);

    // 监听预警线设置
    document.getElementById('warningLineForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const warningLine = parseFloat(document.getElementById('warningLine').value);
        data.warningLine = warningLine;
        saveData();
        updateChart();
    });

    // 监听表单提交
    document.getElementById('behaviorForm').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const direction = document.getElementById('direction').value;
        const value = document.getElementById('value').value;

        data.behaviors.push({
            direction,
            value: parseFloat(value),
            timestamp: new Date().getTime()
        });

        saveData();
        updateChart();
        updateHistory();

        // 打印当前状态分数到控制台
        console.log('当前状态分数:', calculateScore());

        // 重置表单
        e.target.reset();
    });
}); 