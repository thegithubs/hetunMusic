// pages/songList/index.js
const app = getApp();
import { player } from '../../lib/main.js';

Page({
  data: {
    loading: true,
    result: null,
    song: null,
    isAdd: false,
    // add: '收藏'
  },
  onLoad(opt) {
    this.setData({
      playerData: wx.getStorageSync('playerData')
    })
    this.getSongList(opt.id)
  },
  getSongList(id){
    const add_songList = wx.getStorageSync('add_songList') || [];
    app.get(`/v3/playlist/detail?id=${id}`)
    .then(res => {
      const { playlist } = res;
      const  isAdd = add_songList.some( i => i.id == playlist.id);
      this.setData({
        result: playlist,
        loading: false,
        isAdd: isAdd,
        // add: isAdd ? '已收藏' : '收藏'
      })
      wx.setNavigationBarTitle({
        title: this.data.result.name,
      })
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
    player(e.currentTarget.dataset.id, this)
  },
  palyAll(){
    //播放全部歌曲
    const all = this.data.result.tracks
    wx.setStorageSync('playerList', all)
    const id = all[0].id
    player(id, this)
  },
  onUnload() {
    let pages = getCurrentPages(),
      prevPage = pages[pages.length - 2] //上一个页面
    prevPage.setData({
      playerData: wx.getStorageSync('playerData')
    })
  },
})