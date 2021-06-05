// pages/songList/index.js
const App = getApp(), url = App.globalData.url;
import m from '../../lib/main.js'
Page({
  data: {
    loading: true,
    album: null,
    songs: null
  },
  onLoad(opt) {
    this.setData({
      playerData: wx.getStorageSync('playerData')
    })
    this.getSongList(opt.id)
  },
  getSongList(id){
    wx.request({
      url: url + `/netease/album?id=${id}`,
      success: res => {
        this.setData({
          loading: false,
          album: res.data.data.album,
          songs: res.data.data.songs
        })
        wx.setNavigationBarTitle({
          title: this.data.album.name,
        })
      }
    })
  },
  player(e){
    m.player(e.currentTarget.dataset.id, this)
  },
  palyAll() {
    //播放全部歌曲
    const all = this.data.songs
    wx.setStorageSync('playerList', all)
    const id = all[0].id
    m.player(id, this)
  },
  onUnload(){
    let pages = getCurrentPages(),
      prevPage = pages[pages.length - 2] //上一个页面
    prevPage.setData({
      playerData: wx.getStorageSync('playerData')
    })
  }
})