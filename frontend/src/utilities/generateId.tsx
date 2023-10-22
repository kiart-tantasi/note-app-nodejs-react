export default function generateId() {
    const char = "abcdefghijklmnopqrstuvwxyz";
    const capChar = char.toUpperCase();
    const num = "1234567890";
    const toRandom = char + capChar + num;
  
    let answer ="";
    for (let i=0;i < 30; i++) {
      answer = answer + toRandom[Math.floor(Math.random() * toRandom.length)];
    }
    return answer;
}