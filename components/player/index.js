// pages/components/player/index.js 播放器组件
const app = getApp();
const backgroundAudioManager = wx.getBackgroundAudioManager();

Component({
  properties: {
    
  },
  data: {
    playCurrent: undefined,
    playerList: wx.getStorageSync('playerList'),
  },
  methods: {
    playCurrent(e) {
      console.log(999, e)
      backgroundAudioManager.src = `http://music.163.com/song/media/outer/url?id=${e.id}.mp3`
      backgroundAudioManager.title = e.name
      backgroundAudioManager.epname = e.al.name
      backgroundAudioManager.singer = e.ar[0].name
      backgroundAudioManager.coverImgUrl = e.al.picUrl
    }
  },
  attached() {
  },
  observers: {
    
  },
  pageLifetimes: {
    
  }
})
