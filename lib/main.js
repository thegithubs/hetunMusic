const str = function(d){
  //json编码 {a:1, b:2} => a=1&b=2
  let json = ''
  for (let i in d) {
    json += i + '=' + encodeURIComponent(d[i]) + '&'
  }
  return json.substring(0, json.length - 1)
}
const json = function(d){
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
  var a = [], k = key || 'name'
  arr.forEach(function (i) {
    a.push(i[k])
  })
  return a.join('/')
}

let playerRq = false
const player = function (id, s, fn) {
  if (playerRq) return
  wx.setStorageSync('playerNew', 1)
  // wx.showLoading({
  //   title: '获取音频地址',
  //   mask: true
  // })
  playerRq = true
  wx.request({
    url: `https://v1.itooi.cn/netease/song?id=${id}`,
    success: res => {
      const info = res.data.data.songs[0]
      info['isPlay'] = 1
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
    },
    fail: res => {
      //读取失败自动加载下一首 与是否随机或单曲无关
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
    },
    complete(){
      playerRq = false
    }
  })
}

module.exports = {
  str,
  json,
  decode,
  encode,
  player,
  concat
}