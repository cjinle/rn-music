import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// 导入最新的 expo-audio
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Search from './search';
import TagList from './taglist';
import { Song } from './types';


const MusicApp: React.FC = () => {
  const [songs, setSongs] = useState<Song[] | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [barWidth, setBarWidth] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const keyword = useRef<string>('王菲');


  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);

  const handlePlay = async (song: Song) => {
    setCurrentSong(song);
    player.replace(song.url);
    await player.play();
  };

  const formatTime = (seconds: number | undefined) => {
    // 增加 NaN 和 有效性检查
    if (seconds === undefined || isNaN(seconds) || seconds <= 0) return "0:00";

    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // 进度条计算 (现在都是秒，直接相除)
  const progressPercentage = (status.duration && !isNaN(status.duration))
    ? (status.currentTime / status.duration) * 100
    : 0;

  // 格式化时间显示
  const currentTimeStr = formatTime(status.currentTime);
  const durationStr = formatTime(status.duration);

  // 获取进度条容器的实际宽度
  const onBarLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  const handleSeek = (event: any) => {
    // 1. 优先获取 Web 端的 offsetX，如果没有则回退到原生端的 locationX
    // 在 React Native Web 中，event.nativeEvent 通常包含 offsetX
    const touchX = event.nativeEvent.offsetX ?? event.nativeEvent.locationX;

    // 2. 严格检查数值有效性
    if (
      touchX !== null &&
      touchX !== undefined &&
      barWidth > 0 &&
      status.duration &&
      !isNaN(status.duration)
    ) {
      const seekPercentage = touchX / barWidth;
      const seekTime = seekPercentage * status.duration;

      // 3. 确保计算结果是有限数字
      if (isFinite(seekTime)) {
        player.seekTo(seekTime);
      }
    }
  };

  const loadInitialSongs = async () => {
    setLoading(true);
    try {
      const results = await Search.getInstance().query(keyword.current);
      setSongs(results);
      setLoading(false);
    } catch (error) {
      console.error("load music err:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInitialSongs();
  }, []);


  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="搜索音乐..."
          style={styles.searchBar}
          onChangeText={(text) => (keyword.current = text)}
          onSubmitEditing={loadInitialSongs}
        />
        <TouchableOpacity
          style={[styles.searchButton, loading && styles.disabledButton]}
          onPress={loadInitialSongs}
          disabled={loading} // 加载中禁用点击
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.searchButtonText}>🔍</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={songs ? songs.filter(s => s.title) : []}
        keyExtractor={(_, index) => `song-${index}`}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Image
              source={item.cover ? { uri: item.cover } : require('../assets/images/react-logo.png')}
              style={styles.albumCover}
            />

            <View style={styles.textContainer}>
              <Text style={styles.songTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.singerName} numberOfLines={1}>
                {item.singer || '未知歌手'}
              </Text>
            </View>

            <TagList tags={item.tags} />

            <TouchableOpacity style={styles.playButton} onPress={() => handlePlay(item)}>
              <Text style={{ color: '#fff' }}>播放</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* 底部播放控制栏 */}
      {currentSong && (
        <View style={styles.bottomBar}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold' }}>{currentSong?.title}</Text>

            <Text style={{ fontSize: 12, color: '#666' }}>
              {currentTimeStr} / {durationStr}
            </Text>

            <Pressable
              // 如果时长还没获取到，就不允许点击跳转
              disabled={!status.duration || isNaN(status.duration)}
              style={[styles.progressBarBg, { opacity: status.duration ? 1 : 0.5 }]}
              onLayout={onBarLayout}
              onPress={handleSeek}
            >
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
              </View>
            </Pressable>
          </View>

          <TouchableOpacity
            style={styles.playIcon}
            onPress={() => status.playing ? player.pause() : player.play()}
          >
            <Text style={{ fontSize: 24 }}>{status.playing ? '⏸' : '▶️'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  searchContainer: {
    flexDirection: 'row', // 横向排列
    alignItems: 'center', // 垂直居中
    marginBottom: 20,
    gap: 10, // 按钮和输入框之间的间距（RN新版本支持）
  },
  searchBar: {
    flex: 1, // 占据左侧所有剩余空间
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    width: 50, // 图标模式通常建议设为正方形
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A0A0A0', // 加载中变灰色
  },
  searchButtonText: {
    fontSize: 20, // 放大图标显示
  },

  listItem: {
    flexDirection: 'row', // 横向排列
    alignItems: 'center', // 垂直居中
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    // 阴影
    boxShadow: '0px 2px 5px rgba(0,0,0,0.05)',
    elevation: 2,
  },
  albumCover: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#eee', // 图片加载前的占位色
  },
  textContainer: {
    flex: 1, // 关键：占据中间所有空间
    justifyContent: 'center',
    // marginRight: 8,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  singerName: {
    fontSize: 13,
    color: '#888', // 比标题颜色浅
  },
  playButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20, // 圆角矩形按钮
    marginLeft: 10,
  },


  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100, // 稍微加高一点，给进度条留空间
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20, // 适配底部安全区域
    boxShadow: '0px -2px 10px rgba(0,0,0,0.05)', // Web 端阴影
    elevation: 5, // Android 阴影
  },
  // 播放按钮图标容器
  playIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },


  // 进度条背景槽
  progressBarBg: {
    height: 20,           // 较大的高度，方便手指/鼠标点击
    width: '100%',
    justifyContent: 'center', // 内部线条居中
    cursor: 'pointer',    // Web 端鼠标手型
  },
  progressBarTrack: {     // 实际看到的灰色底条
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  progressBarFill: {      // 实际看到的蓝色进度
    height: '100%',
    backgroundColor: '#007AFF',
    // 移除 pointerEvents，统一在父级 Pressable 处理
  },
});

export default MusicApp;
