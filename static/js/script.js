const edlInput = document.getElementById('edlInput');
const srtInput = document.getElementById('srtInput');
const sceneTable = document.getElementById('sceneTable');
const videoPlayer = document.getElementById('videoPlayer');
let scenes = [];
let subtitles = [];
let metadata = { title: '', fcm: '' };
let currentSceneIndex = -1;

// EDLファイルの読み込み
edlInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        parseEDL(e.target.result);
        console.log('EDL読み込み完了後、updateSceneTableを呼び出します');
        updateSceneTable(); // EDL読み込み後に必ずテーブルを更新
    };
    reader.readAsText(file);
});

// SRTファイルの読み込み
srtInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        parseSRT(e.target.result);
        console.log('SRT読み込み完了後、updateSceneTableを呼び出します');
        updateSceneTable(); // SRT読み込み後もテーブルを更新
    };
    reader.readAsText(file);
});

// EDLファイルのパース（CMX3600形式）
function parseEDL(content) {
    scenes = [];
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log('EDL行数:', lines.length);
    let currentScene = null;
    let recordTimeOffset = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        console.log('処理中の行:', line);

        if (line.startsWith('TITLE:')) {
            metadata.title = line.substring(6).trim();
            console.log('タイトル:', metadata.title);
            continue;
        }

        if (line.startsWith('FCM:')) {
            metadata.fcm = line.substring(4).trim();
            console.log('FCM:', metadata.fcm);
            continue;
        }

        const parts = line.split(/\s+/);
        if (parts.length >= 8 && !isNaN(parts[0])) {
            const recordIn = parts[6];
            const recordOut = parts[7];

            currentScene = {
                eventNumber: parts[0],
                filename: null,
                inTime: parts[4],
                outTime: parts[5],
                recordIn: recordIn,
                recordOut: recordOut,
                recordTimeStart: recordTimeOffset
            };

            const duration = timeToSeconds(recordOut) - timeToSeconds(recordIn);
            recordTimeOffset += duration;
            console.log('シーン解析中:', currentScene);
            continue;
        }

        if (currentScene && line.includes('FROM CLIP NAME:')) {
            currentScene.filename = line.split('FROM CLIP NAME:')[1].trim();
            scenes.push(currentScene);
            console.log('シーン追加:', currentScene);
            currentScene = null;
        }
    }

    console.log('最終的なscenes配列:', scenes);
    updateSceneTable();
    document.getElementById('edlStatus').textContent =
        `EDLファイルを読み込みました。タイトル: ${metadata.title}, FCM: ${metadata.fcm}, シーン数: ${scenes.length}`;
}

// SRTファイルのパース（デバッグ用ログを追加）
function parseSRT(content) {
    subtitles = []; // subtitles配列をリセット
    const blocks = content.trim().split(/\n\s*\n/); // 空行でブロックを分割
    console.log('SRTブロック数:', blocks.length);

    blocks.forEach(block => {
        const lines = block.trim().split('\n');
        if (lines.length < 3) {
            console.log('無効なSRTブロック:', block);
            return;
        }

        const numberMatch = lines[0].match(/\d+/);
        if (!numberMatch) {
            console.log('番号が見つかりません:', lines[0]);
            return;
        }
        const number = parseInt(numberMatch[0], 10);

        const timeLine = lines[1].split(' --> ');
        if (timeLine.length !== 2) {
            console.log('無効な時間範囲:', lines[1]);
            return;
        }

        const startTime = timeLine[0].trim();
        const endTime = timeLine[1].trim();
        const text = lines.slice(2)
            .join('\n')
            .trim()
            .replace(/<\/?[^>]+(>|$)/g, '')
            .replace(/\r/g, '');

        subtitles.push({
            number: number,
            start: startTime,
            end: endTime,
            text: text
        });
        console.log('解析済み字幕:', { number, start: startTime, end: endTime, text });
    });

    console.log('最終的なsubtitles配列:', subtitles);
    subtitles.sort((a, b) => a.number - b.number);
    document.getElementById('edlStatus').textContent += `, 字幕数: ${subtitles.length}`;
}


// 時間を秒に変換（HH:MM:SS:FF形式）
function timeToSeconds(timeStr) {
    try {
        const [hours, minutes, seconds, frames] = timeStr.split(':').map(Number);
        const frameRate = 29.97;
        return hours * 3600 + minutes * 60 + seconds + (frames / frameRate);
    } catch (error) {
        console.error('時間変換エラー:', timeStr, error);
        return 0;
    }
}

// SRTの時間形式（HH:MM:SS,mmm）を秒に変換
function srtTimeToSeconds(timeStr) {
    const [time, ms] = timeStr.split(',');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds + (parseInt(ms) / 1000);
}

// シーン一覧をテーブルに表示（SRTのインデックスに基づくシンプルな割り当て）
function updateSceneTable() {
    const tbody = sceneTable.querySelector('tbody');
    tbody.innerHTML = ''; // テーブル内容をクリア

    if (scenes.length === 0) {
        sceneTable.style.display = 'none';
        return;
    }

    sceneTable.style.display = 'table';

    // scenesの各行に対して、対応するSRTのnumber（インデックス）に基づき台詞を割り当て
    scenes.forEach((scene, index) => {
        // SRTのnumberとscenesのeventNumberを一致させる（1始まりのインデックスを調整）
        const srtIndex = index + 1; // scenesのインデックス（0始まり）をSRTのnumber（1始まり）に合わせる
        const matchingSubtitle = subtitles.find(sub => sub.number === srtIndex);

        const subtitleText = matchingSubtitle
            ? `<div class="subtitle-entry">${matchingSubtitle.number}: ${matchingSubtitle.text.replace(/\n/g, ' ')}</div>`
            : '<div class="subtitle-entry">台詞なし</div>';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${scene.filename || '未定義'}</td>
            <td>${scene.inTime}</td>
            <td>${scene.outTime}</td>
            <td class="subtitle">${subtitleText}</td>
            <td><button class="play-button" onclick="playScene(${index})">プレビュー</button></td>
        `;
        tbody.appendChild(row);
    });
}

// シーンを再生（フレーム精度を維持）
function playScene(index) {
    currentSceneIndex = index;
    const scene = scenes[index];

    // ファイル名から余分な空白と先頭のコロンを削除
    const cleanFilename = scene.filename.replace(/^[:\s]+/, '').trim();
    
    // 動画ファイルに直接アクセス
    const videoUrl = 'http://localhost:8000/' + encodeURIComponent(cleanFilename);
    console.log('動画URL:', videoUrl);

    const frameRate = 29.97;
    const [inHours, inMinutes, inSeconds, inFrames] = scene.inTime.split(':').map(Number);
    const [outHours, outMinutes, outSeconds, outFrames] = scene.outTime.split(':').map(Number);

    const inTime = (inHours * 3600 + inMinutes * 60 + inSeconds) + (inFrames / frameRate);
    const outTime = (outHours * 3600 + outMinutes * 60 + outSeconds) + (outFrames / frameRate);

    videoPlayer.src = videoUrl;
    videoPlayer.currentTime = inTime;
    videoPlayer.play();

    videoPlayer.ontimeupdate = () => {
        if (videoPlayer.currentTime >= outTime) {
            videoPlayer.pause();
            if (currentSceneIndex < scenes.length - 1) {
                setTimeout(() => playScene(currentSceneIndex + 1), 100);
            }
        }
    };
}