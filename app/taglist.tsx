import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const TAG_CONFIG: Record<string, { bg: string; text: string }> = {
  '咪咕': { bg: '#FFEBF2', text: '#E6005C' },
  'QQ': { bg: '#E6F8F0', text: '#31C27C' },
  '网易云': { bg: '#FBECEC', text: '#D33030' },
  '酷我': { bg: '#FFF9E6', text: '#A37E00' },
  'default': { bg: '#F5F5F5', text: '#9E9E9E' },
};

interface TagListProps {
  tags: string[] | undefined
}

const TagList: React.FC<TagListProps> = ({ tags }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <View style={styles.tagContainer}>
      {tags.map((tagName) => {
        const config = TAG_CONFIG[tagName] || TAG_CONFIG['default'];
        return (
          <View key={tagName} style={[styles.tag, { backgroundColor: config.bg }]}>
            <Text style={[styles.tagText, { color: config.text }]}>{tagName}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default TagList;
