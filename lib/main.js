const app = getApp();

const str = function(d){
  //json编码 {a:1, b:2} => a=1&b=2
  let json = ''
  for (let i in d) {
    json += i + '=' + encodeURIComponent(d[i]) + '&'
  }
  return json.substring(0, json.length - 1)
}
const json = function(d){
  console.log(999, d)
  //json字符串转对象 a=1&b=2 => {a:1, b:2}
  if (!d || typeof d != 'string') return
  let str = d.split('&'), json = {}
  str.forEach( item => {
    let sp = item.split('=')
    json[sp[0]] = decode(sp[1])
  })
  return json
}
const decode = function(str){
  return decodeURIComponent(str)
}
const encode = function (str) {
  return encodeURIComponent(str)
}
const concat = function (arr, key) {
  if (!arr) return;
  var a = [], k = key || 'name'
  arr.forEach((i) => {
    a.push(i[k])
  });
  return a.join('/');
}

let playerRq = false
const player = function (id, s, fn) {
  if (playerRq) return
  wx.setStorageSync('playerNew', 1)
  playerRq = true;
  app.get(`https://api.imjad.cn/cloudmusic/?type=song&id=${id}&br=128000`, {full: true})
  .then(res => {
    console.log('start: player', res)
    playerRq = false;
    const info = res.data[0]
    info.isPlay = 1
    info.al = {};
    info.al.name = 'aaa'
    info.picUrl = 'http://p2.music.126.net/lqjULlOBxuA6q-hUraovtQ==/109951165699833802.jpg?param=180y180'
    s.setData({
      playerData: info
    })
    wx.setStorageSync('playerData', info)
    //添加到播放列表
    let playerList = wx.getStorageSync('playerList') || []
    wx.setStorageSync('scrollIntoView', 'lrcRow0')
    if (!playerList.some(i => i.id == info.id)){
      playerList.unshift(info)
      //if (playerList.length > 2000) playerList.splice(playerList.length - 1, 1)
      wx.setStorageSync('playerList', playerList)
      s.setData({
        playerData: info
      })
    }
    typeof fn == 'function' && fn()
  }).catch(() => {
    console.log('catch')
    //读取失败自动加载下一首 与是否随机或单曲无关
    playerRq = false;
    let playerList = wx.getStorageSync('playerList') || [],
      errIdx = Number(playerList.indexOf(id))
    errIdx += 1
    if (errIdx == playerList.length - 1) errIdx = 0
    player(playerList[errIdx].id, s, fn)
    wx.hideLoading()
    wx.showToast({
      title: '加载失败',
      icon: 'none'
    })
  })
}

const lt10w = (n) => {
  const max = 100000;
  if (n > max) return Number.parseFloat(n / max).toFixed(2) + 'w';
  return n;
}

module.exports = {
  str,
  json,
  decode,
  encode,
  player,
  concat,
  lt10w,
}