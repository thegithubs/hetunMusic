// pages/songList/index.js
const App = getApp(), url = App.globalData.url;
import m from '../../lib/main.js'
Page({
  data: {
    loading: true,
    song: null,
    isAdd: false,
    add: '收藏'
  },
  onLoad(opt) {
    this.setData({
      playerData: wx.getStorageSync('playerData')
    })
    this.getSongList(opt.id)
  },
  getSongList(id){
    const add_songList = wx.getStorageSync('add_songList') || []
    wx.request({
      url: `https://music.163.com/api/playlist/detail?id=${id}`,
      //url: url + `/netease/songList?id=${id}`,
      success: res => {
        const result = res.data.result,
          isAdd = add_songList.some( i => i.id == result.id)
        this.setData({
          result: result,
          loading: false,
          isAdd: isAdd,
          add: isAdd ? '已收藏' : '收藏'
        })
        wx.setNavigationBarTitle({
          title: this.data.result.name,
        })
      }
    })
  },
  add(e){
    //收藏歌单
    if (this.data.isAdd) return
    const old = wx.getStorageSync('add_songList') || []
    const result = this.data.result
    if (!result) return
    const  d = {
      coverImgUrl: result.coverImgUrl,
      name: result.name,
      id: result.id
    }
    this.setData({
      isAdd: true,
      add: '已收藏'
    })
    wx.setStorageSync('add_songList', old.concat(d))
  },
  player(e){
    //播放单曲
    m.player(e.currentTarget.dataset.id, this)
  },
  palyAll(){
    //播放全部歌曲
    const all = this.data.result.tracks
    wx.setStorageSync('playerList', all)
    const id = all[0].id
    m.player(id, this)
  },
  onUnload() {
    let pages = getCurrentPages(),
      prevPage = pages[pages.length - 2] //上一个页面
    prevPage.setData({
      playerData: wx.getStorageSync('playerData')
    })
  }
})