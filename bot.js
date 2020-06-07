const Discord = require('discord.js');
const client = new Discord.Client();
const botconfig = require('./config.json');
const fs = require('fs');
const readme = fs.readFileSync("README.md").toString();
let quizList = require('./quizList.json');

client.on('ready', () => {
    console.log('I am ready!');
});
const config = {
    allowedChannel:['자유', '투기장'],
    enrollAllowedChannel: ['봇'],
}
let game = {
    start: false,
    times: 1,
    score: {},
}
let current = {
    times: 0,
    index: 0,
    quiz: "",
    answer: "",
    hint: "",
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}
function init(){
    game = {
        start: false,
        times: 1,
        score: {},
    }
    current = {
        times: 0,
        index: 0,
        quiz: "",
        answer: "",
        hint: "",
    }
}

function question(){
    let str = "";
    const rnd = getRandomInt(0, quizList.length);
    current = {
        times: current.times + 1,
        index: rnd,
        quiz: quizList[rnd].quiz,
        answer: quizList[rnd].answer,
        hitn: quizList[rnd].hint,

    }
    str += `문제 : ${current.quiz}\n`;
    str += `\n`;
    str += `힌트를 보려면 /acqhint를 입력하세요!\n`;
    return str;
}
function checkAlreadyHas(obj){
    let alreadyHas = false;
    quizList.forEach((element)=>{
        if(element.answer === obj.answer){
            alreadyHas = true;
        }
    })
    return alreadyHas;
}

function enroll(obj){
    quizList.push(obj);
    fs.writeFile('./quizList.json', JSON.stringify(quizList), 'utf8', function(err) {
        console.log('비동기적 파일 쓰기 완료');
    });
}
function update(obj){
    const index = 0;
    quizList.forEach((element, i)=>{
        if(element.quiz === obj.quiz){
            index === i;
        }
        if(element.answer === obj.answer){
            index === i;
        }
    })
    quizList[index] = obj;
}
function callHint(){
    let str = "";
    const {quiz, hint} = quizList[current.index];
    str += `문제 : ${quiz}\n`;
    str += `힌트 : ${hint}\n`;
    return str;
}
function quote(str){
    return "\`\`\`"+str+"\`\`\`";
}

client.on('message', msg => {
    const {content, channel, author} = msg;

        let commands = content.split('&');
    
        if(content.startsWith('/acqhelp') || content === '/acq'){
            channel.send(quote(readme));
        }

        if(game.start){ //게임 활성화
            if (content.startsWith('/acqquit')) {
                game.start = false;
                game.times = 1;
                game.score = {}
                channel.send(`애니 초성 퀴즈를 강제 종료 합니다.`);
            }
            if(content.startsWith('/acqhint')){
                channel.send(quote(callHint()));
            }
        }else{ //게임 비활성화
            if (content.startsWith('/acqstart')) {
                init();
                game.start = true;
                game.times = Number(commands[1]) ? Number(commands[1]) : 1;
                channel.send(`애니 초성 퀴즈 ${game.times}문항을 시작합니다.`);
                channel.send(quote(question()));
            }
        }

        if(game.start && content === current.answer){
            current.answer = "";
            channel.send(`${author}님, 정답입니다!`);
            if(game.score[author] === undefined){
                game.score[author] = 0;
            }
            game.score[author] += 1;

            if(current.times >= game.times){
                channel.send('최종 결과입니다.');
                let str = "=============\n";
                for(const key in game.score){
                    str += `${key} : ${game.score[key]}점\n`;
                }
                str += "=============\n";
                channel.send(str);
                channel.send('퀴즈를 종료합니다.');
                game.start = false;
                game.times = 1;
                game.score = {}
            }else{
                channel.send('다음문제입니다.');
                channel.send(quote(question()));
            }
        }

        // /acqenroll&ㅅㅁㅇ ㅇㄴ ㅅㄱ&신만이 아는 세계&fact가 제일 좋아하는 만화이자 애니
        if(content.startsWith('/acqenroll')){
            const obj = {
                quiz: commands[1],
                answer: commands[2],
                hint: commands[3],
            }
            if(checkAlreadyHas(obj)){ // 이미 있음
                channel.send("이미 있습니다.");
            }else if(commands[1].length !== commands[2].length){ // 글자수가 다름
                channel.send("퀴즈와 정답의 글자수가 일치하지 않습니다");
            }else{
                channel.send("새 퀴즈가 추가 될 겁니다. (아마도)");
                try{
                    enroll(obj);
                    quizList = require('./quizList.json');
                }catch(err){
                    console.log(err);
                    channel.send("에러가 발생했습니다.");
                }
            }
        }
        
});

// THIS  MUST  BE  THIS  WAY
client.login(botconfig.token);//BOT_TOKEN is the Client Secret